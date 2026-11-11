"""Smoke Sim sprite pipeline: builds every low-poly model, renders each sprite
top-down, and packs public/smoke-sim/atlas.png + atlas.json.

Run inside Blender (UI via MCP, or headless):
    blender -b -P assets-src/smoke-sim/render_sprites.py
    blender -b assets-src/smoke-sim/smoke-sim.blend -P assets-src/smoke-sim/render_sprites.py

Optional globals when exec'd from another script/MCP:
    SMOKE_STAGES = ("build", "render", "pack", "save")   # any subset, in order
    SMOKE_ONLY   = ("player.", "prop.bed")                # render only names with these prefixes

Conventions
- 1 world unit = 32 px in the final atlas. Player is ~1 unit wide.
- Every sprite faces +X (right in the image) and is centered on its origin.
- Renders at 2x, then nearest-neighbour downscale, alpha thresholded (crisp pixels).
- Toon look: Diffuse -> Shader to RGB -> constant ramp x palette colour, plus a
  cyan rim on edges facing away from the facing direction (-X), plus a real
  low rim light from behind. Inverted-hull outlines via a Solidify modifier.
"""

import json
import math
import os
import tempfile
from functools import partial

import bmesh
import bpy
import numpy as np
from mathutils import Euler, Matrix, Vector


# ---------------------------------------------------------------- paths ----

def _here():
    f = globals().get("__file__")
    if f and os.path.exists(f):
        return os.path.dirname(os.path.abspath(f))
    if bpy.data.filepath:
        return os.path.dirname(bpy.data.filepath)
    raise RuntimeError("Run this file with __file__ set, or from smoke-sim.blend")


HERE = _here()
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "public", "smoke-sim")
BLEND = os.path.join(HERE, "smoke-sim.blend")
SHEET = os.path.join(HERE, "contact-sheet.png")
TMP = os.path.join(tempfile.gettempdir(), "smoke-sim-frames")

PX = 32          # final pixels per world unit
SS = 2           # supersample factor (render at 2x, nearest downscale)
OUTLINE = 0.045  # inverted hull thickness (~1.5 px)
U = 1.0 / PX     # one final pixel in world units
PORTRAIT_SCALE = 0.98

# ------------------------------------------------------------- palette ----
# One limited neon-noir palette (sRGB hex). Every material uses these.
PALETTE = {
    "ink": "#0b0b14", "night": "#161629", "void": "#120a1c", "slate": "#2b2d42",
    "steel": "#5c677d", "grey": "#8d99ae", "bone": "#edf2f4", "tile": "#cde6ee",
    "skin": "#e0a872", "skin2": "#b97a4e", "mouth": "#7a1f2b", "hair": "#2a1a14",
    "wood": "#6b3f2a", "wood2": "#8f5a36", "wood3": "#4a2a1c", "amber": "#b8651b",
    "clay": "#a8532e", "denim": "#2f4a7a", "plum": "#4b1d5e", "violet": "#7b2fa0",
    "maroon": "#6d1a36", "leaf": "#1f8a4c", "cyan": "#00f0ff", "magenta": "#ff007f",
    "purple": "#bd00ff", "green": "#39ff14", "yellow": "#ffe600", "orange": "#ff6b1a",
    "red": "#e01e37", "rim": "#a8f6ff",
}


def lin(key):
    h = PALETTE[key].lstrip("#")
    out = []
    for i in (0, 2, 4):
        v = int(h[i:i + 2], 16) / 255.0
        out.append(((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92)
    return tuple(out)


# ----------------------------------------------------------- materials ----

def _fresh_material(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    m.node_tree.nodes.clear()
    return m


def T(key, rim="rim", rim_strength=0.45):
    """Toon material in palette colour `key` with a rim tint on -X facing edges."""
    name = f"toon_{key}" + ("" if rim == "rim" else f"_{rim}")
    m = bpy.data.materials.get(name)
    if m and m.get("smoke_built"):
        return m
    m = _fresh_material(name)
    nt, N, L = m.node_tree, m.node_tree.nodes, m.node_tree.links

    diff = N.new("ShaderNodeBsdfDiffuse")
    diff.inputs["Color"].default_value = (1, 1, 1, 1)
    s2r = N.new("ShaderNodeShaderToRGB")
    ramp = N.new("ShaderNodeValToRGB")
    cr = ramp.color_ramp
    cr.interpolation = "CONSTANT"
    cr.elements[0].position, cr.elements[0].color = 0.0, (0.42, 0.42, 0.42, 1)
    cr.elements[1].position, cr.elements[1].color = 0.2, (0.72, 0.72, 0.72, 1)
    e = cr.elements.new(0.6)
    e.color = (1, 1, 1, 1)
    mul = N.new("ShaderNodeVectorMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = lin(key)

    # rim mask: grazing angle AND normal pointing backwards (-X)
    lw = N.new("ShaderNodeLayerWeight")
    lw.inputs["Blend"].default_value = 0.35
    gt1 = N.new("ShaderNodeMath")
    gt1.operation = "GREATER_THAN"
    gt1.inputs[1].default_value = 0.55
    geo = N.new("ShaderNodeNewGeometry")
    dot = N.new("ShaderNodeVectorMath")
    dot.operation = "DOT_PRODUCT"
    dot.inputs[1].default_value = (-1, 0, 0)
    gt2 = N.new("ShaderNodeMath")
    gt2.operation = "GREATER_THAN"
    gt2.inputs[1].default_value = 0.25
    both = N.new("ShaderNodeMath")
    both.operation = "MULTIPLY"
    scale = N.new("ShaderNodeVectorMath")
    scale.operation = "SCALE"
    scale.inputs[0].default_value = tuple(c * rim_strength for c in lin(rim))
    add = N.new("ShaderNodeVectorMath")
    add.operation = "ADD"
    emit = N.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = 1.0
    out = N.new("ShaderNodeOutputMaterial")

    L.new(diff.outputs[0], s2r.inputs[0])
    L.new(s2r.outputs["Color"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], mul.inputs[0])
    L.new(lw.outputs["Facing"], gt1.inputs[0])
    L.new(geo.outputs["Normal"], dot.inputs[0])
    L.new(dot.outputs["Value"], gt2.inputs[0])
    L.new(gt1.outputs[0], both.inputs[0])
    L.new(gt2.outputs[0], both.inputs[1])
    L.new(both.outputs[0], scale.inputs["Scale"])
    L.new(mul.outputs["Vector"], add.inputs[0])
    L.new(scale.outputs["Vector"], add.inputs[1])
    L.new(add.outputs["Vector"], emit.inputs["Color"])
    L.new(emit.outputs[0], out.inputs["Surface"])
    m.diffuse_color = (*lin(key), 1)
    m["smoke_built"] = True
    return m


def E(key):
    """Flat emissive material: exact palette colour (neon parts, tiles)."""
    name = f"emit_{key}"
    m = bpy.data.materials.get(name)
    if m and m.get("smoke_built"):
        return m
    m = _fresh_material(name)
    N, L = m.node_tree.nodes, m.node_tree.links
    emit = N.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (*lin(key), 1)
    emit.inputs["Strength"].default_value = 1.0
    out = N.new("ShaderNodeOutputMaterial")
    L.new(emit.outputs[0], out.inputs["Surface"])
    m.diffuse_color = (*lin(key), 1)
    m["smoke_built"] = True
    return m


def OL(key):
    """Outline material for the inverted hull (back faces only)."""
    name = f"outline_{key}"
    m = bpy.data.materials.get(name)
    if m and m.get("smoke_built"):
        return m
    m = _fresh_material(name)
    N, L = m.node_tree.nodes, m.node_tree.links
    emit = N.new("ShaderNodeEmission")
    emit.inputs["Color"].default_value = (*lin(key), 1)
    out = N.new("ShaderNodeOutputMaterial")
    L.new(emit.outputs[0], out.inputs["Surface"])
    m.use_backface_culling = True
    m.diffuse_color = (*lin(key), 1)
    m["smoke_built"] = True
    return m


# ------------------------------------------------------------ geometry ----

_ctx = {"c": None, "p": None, "ol": "ink"}
_count = [0]


def use(coll, parent, outline="ink"):
    _ctx.update(c=coll, p=parent, ol=outline)


def empty(name, coll, parent=None, loc=(0, 0, 0)):
    ob = bpy.data.objects.new(name, None)
    ob.empty_display_type = "PLAIN_AXES"
    ob.empty_display_size = 0.12
    coll.objects.link(ob)
    ob.parent = parent
    ob.location = loc
    ob["rest_loc"] = list(loc)
    return ob


def part(kind, mat, loc=(0, 0, 0), size=1.0, rot=(0, 0, 0), seg=12, rings=8,
         taper=1.0, bevel=0.0, outline=True, parent=None, name=None, only=None):
    """Create one mesh part. Geometry is baked (object has identity transform
    relative to its parent pivot). size = full extents; rot in degrees."""
    if isinstance(size, (int, float)):
        size = (size, size, size)
    parent = parent or _ctx["p"]
    _count[0] += 1
    name = name or f"{parent.name}.{kind}{_count[0]}"
    bm = bmesh.new()
    if kind == "box":
        bmesh.ops.create_cube(bm, size=1.0)
    elif kind == "sphere":
        bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=0.5)
    elif kind == "ico":
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.5)
    elif kind == "cyl":
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=seg,
                              radius1=0.5, radius2=0.5 * taper, depth=1.0)
    else:
        raise ValueError(kind)
    M = (Matrix.Translation(loc)
         @ Euler([math.radians(a) for a in rot]).to_matrix().to_4x4()
         @ Matrix.Diagonal((*size, 1.0)))
    bmesh.ops.transform(bm, matrix=M, verts=bm.verts)
    if bevel and kind == "box":
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, offset_type="OFFSET",
                        segments=1, profile=0.5, affect="EDGES", clamp_overlap=True)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    _ctx["c"].objects.link(ob)
    ob.parent = parent
    ol = _ctx["ol"] if outline is True else outline
    if ol:
        me.materials.append(OL(ol))
        mod = ob.modifiers.new("outline", "SOLIDIFY")
        mod.thickness = OUTLINE
        mod.offset = 1.0
        mod.use_flip_normals = True
        mod.use_rim = False
        mod.material_offset = 1
    if only:
        ob["only"] = only
        ob.hide_render = True
    return ob


# --------------------------------------------------------- collections ----

def get_coll(name, parent):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
    if c.name not in parent.children:
        parent.children.link(c)
    return c


def wipe():
    top = bpy.data.collections.get("SmokeSim")
    if top:
        for ob in list(top.all_objects):
            bpy.data.objects.remove(ob, do_unlink=True)
        for c in list(top.children_recursive):
            bpy.data.collections.remove(c)
        bpy.data.collections.remove(top)
    for m in list(bpy.data.materials):
        if m.get("smoke_built"):
            del m["smoke_built"]  # rebuilt with current palette
    bpy.data.orphans_purge(do_recursive=True)


def groups():
    top = get_coll("SmokeSim", bpy.context.scene.collection)
    return {k: get_coll(k, top) for k in ("rig", "chars", "props", "tiles")}


def leaf_colls():
    return [c for c in bpy.data.collections
            if c.name.split("_")[0] in ("char", "prop", "tile")]


# ------------------------------------------------------------- scene ----

def setup_scene(G):
    sc = bpy.context.scene
    r = sc.render
    r.engine = "BLENDER_EEVEE"
    r.film_transparent = True
    r.resolution_percentage = 100
    r.filter_size = 1.0
    r.image_settings.file_format = "PNG"
    r.image_settings.color_mode = "RGBA"
    r.image_settings.color_depth = "8"
    sc.eevee.taa_render_samples = 8
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    sc.view_settings.gamma = 1.0

    w = bpy.data.worlds.get("smoke-sim") or bpy.data.worlds.new("smoke-sim")
    sc.world = w
    w.color = (0, 0, 0)
    try:
        w.use_nodes = True
    except Exception:
        pass
    if w.node_tree:
        bg = w.node_tree.nodes.get("Background")
        if bg:
            bg.inputs["Color"].default_value = (0, 0, 0, 1)
            bg.inputs["Strength"].default_value = 0.0

    rig = G["rig"]
    cam_data = bpy.data.cameras.new("SpriteCam")
    cam_data.type = "ORTHO"
    cam_data.clip_start = 0.1
    cam_data.clip_end = 60
    cam = bpy.data.objects.new("SpriteCam", cam_data)
    rig.objects.link(cam)
    sc.camera = cam

    def sun(name, direction, strength):
        ld = bpy.data.lights.new(name, "SUN")
        ld.energy = strength
        ld.use_shadow = False
        ob = bpy.data.objects.new(name, ld)
        rig.objects.link(ob)
        ob.rotation_euler = Vector(direction).normalized().to_track_quat("-Z", "Y").to_euler()
        ob.location = (0, 0, 8)
        return ob

    sun("KeyLight", (-0.35, -0.3, -1.0), 1.0)    # from above, front-left
    sun("RimLight", (1.0, 0.0, -0.35), 1.6)      # low, from behind (-X)
    face = sun("FaceLight", (-1.0, 0.35, -0.5), 0.9)  # portraits only
    face.hide_render = True


# ----------------------------------------------------------- characters ----

def hair_player(c, head, spine, m, P):
    P("sphere", m("hair"), loc=(-0.035, 0, 0.35), size=(0.56, 0.56, 0.44), seg=12, rings=7, parent=head)
    P("sphere", m("cyan"), loc=(-0.24, 0, 0.0), size=(0.22, 0.5, 0.26), seg=10, rings=6, parent=head)
    for sy in (1, -1):
        P("cyl", m("bone"), loc=(0.2, 0.08 * sy, 0.34), size=(0.03, 0.03, 0.16), seg=4,
          parent=spine, outline=False)
    # knife in the right hand, shown only in attack frames (blade along arm -Z, flat in Y)
    sh = bpy.data.objects["player.shR"]
    P("box", T("maroon"), loc=(0, 0, -0.5), size=(0.05, 0.05, 0.13), parent=sh, only="knife")
    P("box", T("slate"), loc=(0, 0, -0.57), size=(0.03, 0.11, 0.03), parent=sh, outline=False, only="knife")
    P("box", T("grey"), loc=(0, 0, -0.68), size=(0.015, 0.07, 0.2), parent=sh, only="knife")
    P("box", T("grey"), loc=(0, 0, -0.78), size=(0.015, 0.05, 0.05), rot=(45, 0, 0), parent=sh, only="knife")
    P("box", E("bone"), loc=(0.009, -0.025, -0.68), size=(0.004, 0.012, 0.18), parent=sh, outline=False,
      only="knife")


def hair_vahe(c, head, spine, m, P):
    P("sphere", m("slate"), loc=(0, 0, 0.44), size=(0.58, 0.58, 0.34), seg=12, rings=6, parent=head)
    P("box", m("green"), loc=(-0.33, 0, 0.4), size=(0.24, 0.34, 0.03), bevel=0.01, parent=head)
    P("sphere", m("green"), loc=(0, 0, 0.61), size=0.08, seg=6, rings=4, parent=head)


def hair_karen(c, head, spine, m, P):
    for x, y, z, s in [(-0.05, 0, 0.5, 0.34), (0.06, 0.12, 0.47, 0.24), (0.06, -0.12, 0.47, 0.24),
                       (-0.12, 0.16, 0.4, 0.28), (-0.12, -0.16, 0.4, 0.28), (-0.2, 0, 0.33, 0.3),
                       (0.1, 0, 0.52, 0.22)]:
        P("ico", m("hair"), loc=(x, y, z), size=s, parent=head)
    for sy in (1, -1):
        P("box", T("ink"), loc=(0.272, 0.095 * sy, 0.31), size=(0.03, 0.13, 0.09), parent=head, outline=False)
        P("box", E("cyan"), loc=(0.285, 0.095 * sy, 0.31), size=(0.012, 0.09, 0.05), parent=head, outline=False)
        P("box", T("ink"), loc=(0.17, 0.16 * sy, 0.33), size=(0.2, 0.015, 0.02), parent=head, outline=False)
    P("box", T("ink"), loc=(0.28, 0, 0.33), size=(0.03, 0.06, 0.02), parent=head, outline=False)


def hair_grish(c, head, spine, m, P):
    P("sphere", m("night"), loc=(0, 0, 0.46), size=(0.58, 0.58, 0.36), seg=12, rings=6, parent=head)
    P("cyl", m("magenta"), loc=(0, 0, 0.4), size=(0.6, 0.6, 0.06), seg=12, parent=head)
    P("ico", m("magenta"), loc=(0, 0, 0.66), size=0.16, parent=head)
    P("sphere", m("hair"), loc=(0.13, 0, 0.07), size=(0.3, 0.46, 0.26), seg=10, rings=6, parent=head)


def hair_petrosian(c, head, spine, m, P):
    for sy in (1, -1):
        P("sphere", m("grey"), loc=(-0.06, 0.24 * sy, 0.27), size=(0.28, 0.1, 0.18), seg=8, rings=5, parent=head)
    P("sphere", m("grey"), loc=(-0.22, 0, 0.25), size=(0.14, 0.42, 0.2), seg=8, rings=5, parent=head)
    P("box", m("grey"), loc=(0.27, 0, 0.21), size=(0.06, 0.2, 0.05), bevel=0.015, parent=head, outline=False)
    P("sphere", m("maroon"), loc=(0.12, 0, 0.2), size=(0.36, 0.6, 0.42), seg=10, rings=6, parent=spine)
    P("cyl", m("wood2"), loc=(0.04, 0, 0.2), size=(0.62, 0.68, 0.06), seg=12, parent=spine)
    for sy in (1, -1):  # robe lapels
        P("box", m("bone"), loc=(0.2, 0.12 * sy, 0.47), size=(0.06, 0.1, 0.12), rot=(0, 0, 25 * sy),
          parent=spine, outline=False)


def hair_shadow(c, head, spine, m, P):
    spikes = [((-0.12, 0, 0.5), (0, -35, 0)), ((-0.05, 0.15, 0.5), (-25, -20, 0)),
              ((-0.05, -0.15, 0.5), (25, -20, 0)), ((0.06, 0.08, 0.53), (-15, 5, 0)),
              ((0.06, -0.08, 0.53), (15, 5, 0)), ((-0.22, 0.1, 0.36), (-20, -60, 0)),
              ((-0.22, -0.1, 0.36), (20, -60, 0))]
    for loc, rot in spikes:
        P("cyl", m("void"), loc=loc, size=(0.16, 0.16, 0.32), rot=rot, taper=0.0, seg=5, parent=head)
    for sy in (1, -1):
        P("box", E("magenta"), loc=(0.255, 0.09 * sy, 0.31), size=(0.05, 0.11, 0.05), rot=(18 * sy, 0, 0),
          parent=head, outline=False)
    P("box", E("magenta"), loc=(0.255, 0, 0.17), size=(0.02, 0.15, 0.02), parent=head, outline=False)
    for sy in (1, -1):  # claws
        sh = bpy.data.objects[f"shadow.sh{'L' if sy > 0 else 'R'}"]
        for k in (-1, 0, 1):
            P("cyl", m("void"), loc=(0.1, 0.04 * k, -0.47), size=(0.04, 0.04, 0.14), rot=(0, 90, 0),
              taper=0.0, seg=4, parent=sh, outline=False)


def hair_brute(c, head, spine, m, P):
    for side, sy in (("L", 1), ("R", -1)):
        sh = bpy.data.objects[f"brute.sh{side}"]
        P("sphere", m("void"), loc=(0, 0, 0.02), size=(0.36, 0.36, 0.3), seg=10, rings=6, parent=sh)
        P("cyl", m("void"), loc=(0, 0.06 * sy, 0.2), size=(0.1, 0.1, 0.2), taper=0.0, seg=5, parent=sh)
        P("sphere", m("void"), loc=(0, 0, -0.48), size=0.25, seg=8, rings=5, parent=sh)
        P("cyl", m("void"), loc=(-0.02, 0.2 * sy, 0.45), size=(0.12, 0.12, 0.3), rot=(-40 * sy, -20, 0),
          taper=0.0, seg=5, parent=head)
    P("sphere", m("void"), loc=(-0.14, 0, 0.42), size=(0.36, 0.7, 0.36), seg=10, rings=6, parent=spine)
    for sy in (1, -1):
        P("box", E("magenta"), loc=(0.255, 0.09 * sy, 0.31), size=(0.05, 0.11, 0.05), rot=(-18 * sy, 0, 0),
          parent=head, outline=False)
    for k in (-1, 0, 1):
        P("box", E("magenta"), loc=(0.255, 0.05 * k, 0.17 + 0.02 * abs(k)), size=(0.02, 0.06, 0.02),
          rot=(25 * k, 0, 0), parent=head, outline=False)
    P("box", E("purple"), loc=(0.2, 0, 0.3), size=(0.02, 0.12, 0.12), rot=(45, 0, 0), parent=spine, outline=False)


CHARS = {
    "player": dict(skin="skin", shirt="cyan", pants="denim", shoes="bone", hair="hair", extra=hair_player),
    "vahe": dict(skin="skin", shirt="green", pants="denim", shoes="ink", hair="hair", bare_arms=True,
                 extra=hair_vahe),
    "karen": dict(skin="skin", shirt="purple", pants="ink", shoes="bone", hair="hair", extra=hair_karen),
    "grish": dict(skin="skin2", shirt="magenta", pants="slate", shoes="ink", hair="hair", bare_arms=True,
                  extra=hair_grish),
    "petrosian": dict(skin="skin", shirt="maroon", pants="grey", shoes="maroon", hair="grey", belly=1.3,
                      extra=hair_petrosian),
    "shadow": dict(skin="void", shirt="void", pants="void", shoes="void", hair="void", hands="void",
                   rim="magenta", outline="plum", face=False, extra=hair_shadow),
    "brute": dict(skin="void", shirt="void", pants="void", shoes="void", hair="void", hands="void",
                  rim="magenta", outline="plum", face=False, belly=1.45, extra=hair_brute),
}
FRIENDS = ("vahe", "karen", "grish", "petrosian")
CHAR_FRAME = {"brute": 80}   # frame px (default 64)
CHAR_SCALE = {"brute": 1.25}  # model scale (default 1)
PORTRAITS = ("player", "vahe", "karen", "grish", "petrosian")
HUMAN_ANIMS = [("idle", 1), ("walk", 4), ("attack", 3), ("dead", 1)]
FRIEND_ANIMS = [("sit", 1), ("panic", 2)]
BOSS_ANIMS = [("idle", 1), ("walk", 4), ("kick", 3), ("steam", 2), ("dead", 1)]


def build_human(cid, s, G):
    c = get_coll("char_" + cid, G["chars"])
    root = empty(cid, c)
    c["root"] = root.name
    rk = s.get("rim", "rim")

    def m(k):
        return T(k, rk)

    use(c, root, s.get("outline", "ink"))
    P = part
    belly = s.get("belly", 1.0)
    for side, sy in (("L", 1), ("R", -1)):
        hip = empty(f"{cid}.hip{side}", c, root, (0, 0.15 * sy, 0.55))
        P("cyl", m(s["pants"]), loc=(0, 0, -0.25), size=(0.2, 0.2, 0.5), seg=8, parent=hip)
        P("box", m(s["shoes"]), loc=(0.07, 0, -0.5), size=(0.32, 0.17, 0.11), bevel=0.025, parent=hip)
    spine = empty(f"{cid}.spine", c, root, (0, 0, 0.55))
    P("box", m(s["shirt"]), loc=(0, 0, 0.27), size=(0.38 * belly, 0.64, 0.56), bevel=0.07, parent=spine)
    for side, sy in (("L", 1), ("R", -1)):
        sh = empty(f"{cid}.sh{side}", c, spine, (0, 0.39 * sy, 0.47))
        P("cyl", m(s["shirt"]), loc=(0, 0, -0.1), size=(0.17, 0.17, 0.22), seg=8, parent=sh)
        P("cyl", m(s["skin"] if s.get("bare_arms") else s["shirt"]), loc=(0, 0, -0.3),
          size=(0.14, 0.14, 0.22), seg=8, parent=sh)
        P("sphere", m(s.get("hands", s["skin"])), loc=(0, 0, -0.45), size=0.17, seg=8, rings=5, parent=sh)
    head = empty(f"{cid}.head", c, spine, (0, 0, 0.55))
    P("cyl", m(s["skin"]), loc=(0, 0, 0.04), size=(0.16, 0.16, 0.1), seg=8, parent=head, outline=False)
    P("sphere", m(s["skin"]), loc=(0, 0, 0.28), size=(0.54, 0.52, 0.54), seg=12, rings=8, parent=head)
    if s.get("face", True):
        for sy in (1, -1):
            P("sphere", T("ink"), loc=(0.245, 0.09 * sy, 0.31), size=(0.05, 0.065, 0.075), seg=6, rings=4,
              parent=head, outline=False)
            P("box", m(s["hair"]), loc=(0.24, 0.095 * sy, 0.395), size=(0.04, 0.11, 0.03), parent=head,
              outline=False)
        P("box", m(s["skin"]), loc=(0.28, 0, 0.25), size=(0.07, 0.06, 0.08), parent=head, outline=False)
        P("box", T("mouth"), loc=(0.255, 0, 0.165), size=(0.03, 0.12, 0.025), parent=head, outline=False)
    s["extra"](c, head, spine, m, P)


def build_boss(G):
    c = get_coll("char_boss", G["chars"])
    root = empty("boss", c)
    c["root"] = root.name
    use(c, root)
    P = part
    st, dk, mg = T("grey"), T("slate"), T("magenta")
    body = empty("boss.body", c, root)
    P("cyl", st, loc=(0, 0, 0.95), size=(2.2, 2.2, 1.3), taper=0.78, seg=16, parent=body)
    P("cyl", dk, loc=(0, 0, 0.33), size=(2.26, 2.26, 0.12), seg=16, parent=body)
    P("cyl", dk, loc=(0, 0, 1.62), size=(1.9, 1.9, 0.08), seg=16, parent=body)
    lid = empty("boss.lid", c, body, (0, 0, 1.64))
    P("cyl", st, loc=(0, 0, 0.1), size=(1.1, 1.1, 0.2), taper=0.6, seg=16, parent=lid)
    P("sphere", mg, loc=(0, 0, 0.28), size=0.34, seg=10, rings=6, parent=lid)
    for sy in (1, -1):
        P("box", E("red"), loc=(0.72, 0.3 * sy, 1.68), size=(0.14, 0.28, 0.04), rot=(0, 0, -20 * sy),
          parent=body, outline=False, name=f"boss.eye{sy}")
        P("box", T("ink"), loc=(0.84, 0.3 * sy, 1.69), size=(0.06, 0.34, 0.05), rot=(0, 0, 25 * sy),
          parent=body, outline=False, name=f"boss.brow{sy}")
        for a in (45, -45):
            P("box", T("ink"), loc=(0.72, 0.3 * sy, 1.68), size=(0.05, 0.3, 0.04), rot=(0, 0, a),
              parent=body, outline=False, only="dead")
    P("cyl", st, loc=(1.24, 0, 1.12), size=(0.5, 0.5, 0.8), taper=0.45, rot=(0, 55, 0), seg=10, parent=body)
    P("cyl", dk, loc=(1.57, 0, 1.35), size=(0.25, 0.25, 0.06), rot=(0, 55, 0), seg=10, parent=body)
    P("box", mg, loc=(-1.2, 0, 1.35), size=(0.5, 0.24, 0.16), bevel=0.03, parent=body)
    P("box", mg, loc=(-1.15, 0, 0.6), size=(0.4, 0.24, 0.16), bevel=0.03, parent=body)
    P("box", mg, loc=(-1.42, 0, 0.98), size=(0.18, 0.24, 0.9), bevel=0.03, parent=body)
    for side, sy in (("L", 1), ("R", -1)):
        sh = empty(f"boss.sh{side}", c, body, (0, 1.0 * sy, 1.05))
        P("cyl", dk, loc=(0, 0.2 * sy, 0), size=(0.2, 0.2, 0.4), rot=(-90 * sy, 0, 0), seg=8, parent=sh)
        P("sphere", T("bone"), loc=(0, 0.45 * sy, 0), size=0.38, seg=10, rings=6, parent=sh)
        hip = empty(f"boss.hip{side}", c, root, (0, 0.62 * sy, 0.3))
        P("cyl", dk, loc=(0, 0, -0.1), size=(0.22, 0.22, 0.25), seg=8, parent=hip)
        P("box", mg, loc=(0.35, 0, -0.2), size=(1.1, 0.4, 0.24), bevel=0.06, parent=hip)
        P("box", T("bone"), loc=(0.35, 0, -0.32), size=(1.12, 0.42, 0.06), parent=hip)
    puffs = {
        "steam0": [((1.62, 0, 1.6), 0.32), ((1.72, 0.18, 1.9), 0.26), ((1.52, -0.15, 1.9), 0.22),
                   ((0, 0.1, 2.2), 0.4), ((0.15, -0.2, 2.5), 0.3)],
        "steam1": [((1.68, 0, 1.6), 0.44), ((1.58, 0.3, 1.95), 0.36), ((1.66, -0.28, 2.0), 0.34),
                   ((0.1, 0, 2.25), 0.55), ((-0.2, 0.3, 2.5), 0.4), ((0.3, -0.3, 2.6), 0.36)],
    }
    for key, lst in puffs.items():
        for loc, s in lst:
            P("ico", T("bone"), loc=loc, size=s, parent=body, only=key)


# ------------------------------------------------------------- posing ----

def piv(cid, n):
    return bpy.data.objects[f"{cid}.{n}"]


def rot(ob, x=0.0, y=0.0, z=0.0):
    ob.rotation_euler = (math.radians(x), math.radians(y), math.radians(z))


def reset(coll_name):
    for ob in bpy.data.collections[coll_name].objects:
        if "rest_loc" in ob:
            ob.location = ob["rest_loc"]
            ob.rotation_euler = (0, 0, 0)
            ob.scale = (1, 1, 1)
        ob.hide_render = "only" in ob


def pose_human(cid, anim, i):
    reset("char_" + cid)
    g = partial(piv, cid)
    root = bpy.data.objects[cid]
    hl, hr, sp, sl, sr, hd = g("hipL"), g("hipR"), g("spine"), g("shL"), g("shR"), g("head")
    k_ = CHAR_SCALE.get(cid, 1.0)
    root.scale = (k_, k_, k_)
    if anim == "attack" and cid == "player":  # knife stab along +X
        for ob in bpy.data.collections["char_player"].objects:
            if ob.get("only") == "knife":
                ob.hide_render = False
        root.location.x = [-0.04, 0.0, 0.0][i]
        rot(sr, x=[-5, 10, 6][i], y=[-55, -88, -70][i])
        rot(sl, x=8, y=[-15, 25, 12][i])
        rot(sp, z=[-18, 15, 6][i])
        rot(hl, y=[10, -18, -8][i])
        rot(hr, y=[-8, 14, 6][i])
        return
    if anim == "attack" and cid == "brute":  # heavy two-handed overhead swing
        root.location.x = [-0.05, 0.04, 0.03][i] * k_
        for s, sg in ((sl, 1), (sr, -1)):
            rot(s, x=-[12, 14, 10][i] * sg, y=[-170, -75, -40][i])
        rot(sp, y=[12, -18, -22][i])
        rot(hl, y=[8, -20, -12][i])
        rot(hr, y=[-6, 10, 6][i])
        return
    if anim == "sit" and cid == "player":  # hands on knees
        rot(hl, y=-88)
        rot(hr, y=-88)
        rot(sl, x=10, y=-52)
        rot(sr, x=-10, y=-52)
        rot(sp, y=-4)
        return
    if anim == "idle":
        rot(sl, x=6)
        rot(sr, x=-6)
    elif anim == "walk":
        a = [28, 8, -28, -8][i]
        rot(hl, y=-a)
        rot(hr, y=a)
        rot(sl, x=6, y=a * 0.9)
        rot(sr, x=-6, y=-a * 0.9)
        rot(sp, z=a * 0.15)
    elif anim == "attack":
        root.location.x = [-0.04, 0.08, 0.03][i]
        rot(hl, y=[10, -18, -8][i])
        rot(hr, y=[-8, 14, 6][i])
        if cid == "shadow":
            for s, sg in ((sl, 1), (sr, -1)):
                rot(s, x=(-14 if i == 1 else 8) * sg, y=[35, -95, -55][i])
        else:
            rot(sr, x=[-10, 14, 6][i], y=[40, -92, -50][i])
            rot(sl, x=8, y=[-20, 25, 10][i])
            rot(sp, z=[-22, 26, 10][i])
    elif anim == "dead":
        root.rotation_euler = (0, math.radians(-90), 0)
        root.location = (0.84 * k_, 0, 0.25 * k_)
        rot(sl, x=55, y=-20)
        rot(sr, x=-55, y=10)
        rot(hl, x=12)
        rot(hr, x=-14)
        rot(hd, z=28)
    elif anim == "sit":
        rot(hl, y=-88)
        rot(hr, y=-88)
        rot(sl, x=8, y=-38)
        rot(sr, x=-8, y=-38)
        rot(sp, y=6)
    elif anim == "panic":
        k = [1, -1][i]
        sx, sy_ = [28, 42][i], [-165, -150][i]
        rot(sl, x=sx, y=sy_)
        rot(sr, x=-sx, y=sy_)
        rot(hd, z=18 * k)
        rot(sp, z=6 * k)
        rot(hl, y=-12 * k)
        rot(hr, y=12 * k)


def pose_boss(anim, i):
    reset("char_boss")
    g = partial(piv, "boss")
    root = bpy.data.objects["boss"]
    hl, hr, body, lid, sl, sr = g("hipL"), g("hipR"), g("body"), g("lid"), g("shL"), g("shR")

    def feet(a, b):
        hl.location.x, hr.location.x = a, b

    if anim == "idle":
        feet(0.15, 0.15)
    elif anim == "walk":
        f = [0.5, 0.15, -0.2, 0.15][i]
        feet(f, 0.3 - f)
        rot(body, z=[5, 0, -5, 0][i])
        for s in (sl, sr):
            rot(s, z=[15, 0, -15, 0][i])
    elif anim == "kick":
        feet(0.25, [-0.3, 0.85, 0.45][i])
        rot(hr, y=[10, -30, -10][i])
        rot(body, y=[6, 10, 3][i])
        rot(sl, z=[20, -25, 0][i])
        rot(sr, z=[-20, 25, 0][i])
    elif anim == "steam":
        feet(0.15, 0.15)
        for ob in bpy.data.collections["char_boss"].objects:
            if ob.get("only") == f"steam{i}":
                ob.hide_render = False
        body.scale = [(1.03, 1.03, 0.97), (0.98, 0.98, 1.03)][i]
        lid.location.z += [0.0, 0.12][i]
        rot(lid, y=[0, -8][i])
    elif anim == "dead":
        root.rotation_euler = (math.radians(90), 0, 0)
        root.location = (0, 0.8, 1.15)
        lid.location = (0.9, 0.0, 2.05)
        rot(lid, x=70)
        rot(sl, x=30)
        rot(sr, x=-30)
        feet(0.1, 0.3)
        for ob in bpy.data.collections["char_boss"].objects:
            if ob.get("only") == "dead":
                ob.hide_render = False
            if ob.name.startswith("boss.eye"):
                ob.hide_render = True


# --------------------------------------------------------------- props ----
# Sizes in world units (32 px each). Fronts face +X.

def p_bed():
    part("box", T("wood3"), loc=(0, 0, 0.15), size=(2.0, 1.4, 0.3), bevel=0.03)
    part("box", T("wood3"), loc=(-0.95, 0, 0.35), size=(0.1, 1.4, 0.7), bevel=0.02)
    part("box", T("bone"), loc=(0.02, 0, 0.36), size=(1.84, 1.3, 0.14), bevel=0.04)
    for sy in (1, -1):
        part("box", T("bone"), loc=(-0.68, 0.3 * sy, 0.48), size=(0.36, 0.5, 0.12), bevel=0.05)
    part("box", T("plum"), loc=(0.3, 0, 0.47), size=(1.28, 1.36, 0.1), bevel=0.04)
    part("box", T("magenta"), loc=(-0.28, 0, 0.475), size=(0.1, 1.37, 0.1), outline=False)


def p_wardrobe():
    part("box", T("wood"), loc=(0, 0, 0.9), size=(0.6, 1.6, 1.8), bevel=0.03)
    part("box", T("wood3"), loc=(0, 0, 1.8), size=(0.48, 1.48, 0.02), outline=False)
    part("box", T("wood"), loc=(0, 0, 1.81), size=(0.48, 0.04, 0.02), outline=False)
    for sy in (1, -1):
        part("sphere", T("yellow"), loc=(0.31, 0.07 * sy, 1.0), size=0.07, seg=6, rings=4)


def p_couch():
    part("box", T("plum"), loc=(0, 0, 0.2), size=(0.9, 2.4, 0.35), bevel=0.04)
    part("box", T("plum"), loc=(-0.33, 0, 0.45), size=(0.25, 2.4, 0.7), bevel=0.06)
    for sy in (1, -1):
        part("box", T("plum"), loc=(0.0, 1.09 * sy, 0.32), size=(0.9, 0.22, 0.55), bevel=0.05)
    for y in (-0.65, 0, 0.65):
        part("box", T("violet"), loc=(0.1, y, 0.44), size=(0.6, 0.62, 0.14), bevel=0.04)
    part("box", T("magenta"), loc=(0.0, 0.75, 0.56), size=(0.32, 0.32, 0.12), rot=(0, 0, 20), bevel=0.05)


def p_table():
    part("box", T("wood2"), loc=(0, 0, 0.42), size=(0.8, 1.4, 0.08), bevel=0.02)
    for sx in (1, -1):
        for sy in (1, -1):
            part("cyl", T("wood3"), loc=(0.32 * sx, 0.62 * sy, 0.2), size=(0.08, 0.08, 0.4), seg=6)
    part("cyl", T("slate"), loc=(0.15, -0.35, 0.48), size=(0.2, 0.2, 0.05), seg=10)
    part("box", T("ink"), loc=(-0.15, 0.3, 0.475), size=(0.09, 0.22, 0.03), rot=(0, 0, 15))


def p_tv():
    part("box", T("wood3"), loc=(0, 0, 0.22), size=(0.42, 1.5, 0.45), bevel=0.02)
    part("box", T("ink"), loc=(-0.04, 0, 0.84), size=(0.12, 1.32, 0.76), bevel=0.01)
    part("box", E("cyan"), loc=(0.025, 0, 0.84), size=(0.01, 1.22, 0.66), outline=False)
    part("box", E("cyan"), loc=(0.0, 0, 1.225), size=(0.04, 1.26, 0.01), outline=False)
    part("box", T("slate"), loc=(-0.04, 0, 0.5), size=(0.12, 0.3, 0.1))


def p_laptop():
    part("box", T("steel"), loc=(0, 0, 0.015), size=(0.45, 0.66, 0.03), bevel=0.01)
    part("box", T("ink"), loc=(0.04, 0, 0.032), size=(0.22, 0.58, 0.005), outline=False)
    part("box", T("slate"), loc=(0.17, 0, 0.032), size=(0.08, 0.2, 0.005), outline=False)
    a = math.radians(35)
    hx, hz, L = -0.225, 0.03, 0.42
    cx, cz = hx - math.sin(a) * L / 2, hz + math.cos(a) * L / 2
    part("box", T("steel"), loc=(cx, 0, cz), size=(0.02, 0.66, L), rot=(0, -35, 0))
    nx, nz = math.cos(a) * 0.012, math.sin(a) * 0.012
    part("box", E("cyan"), loc=(cx + nx, 0, cz + nz), size=(0.006, 0.6, L - 0.05), rot=(0, -35, 0),
         outline=False)


def p_toilet():
    part("box", T("bone"), loc=(-0.26, 0, 0.55), size=(0.22, 0.48, 0.45), bevel=0.03)
    part("cyl", T("bone"), loc=(0.08, 0, 0.2), size=(0.5, 0.42, 0.4), taper=1.15, seg=12)
    part("cyl", T("bone"), loc=(0.08, 0, 0.42), size=(0.56, 0.46, 0.04), seg=12)
    part("cyl", T("denim"), loc=(0.1, 0, 0.445), size=(0.34, 0.26, 0.01), seg=12, outline=False)
    part("cyl", T("steel"), loc=(-0.26, 0, 0.78), size=(0.08, 0.08, 0.02), seg=8, outline=False)


def p_sink():
    part("box", T("bone"), loc=(0, 0, 0.4), size=(0.5, 0.6, 0.8), bevel=0.03)
    part("box", T("tile"), loc=(0.05, 0, 0.805), size=(0.32, 0.42, 0.01), bevel=0.0, outline=False)
    part("cyl", T("ink"), loc=(0.05, 0, 0.81), size=(0.05, 0.05, 0.01), seg=6, outline=False)
    part("cyl", T("steel"), loc=(-0.19, 0, 0.86), size=(0.07, 0.07, 0.12), seg=8)
    part("box", T("steel"), loc=(-0.12, 0, 0.92), size=(0.16, 0.05, 0.04))


def p_fridge():
    part("box", T("bone"), loc=(0, 0, 0.9), size=(0.72, 0.72, 1.8), bevel=0.05)
    part("box", T("steel"), loc=(0.37, 0.27, 1.1), size=(0.04, 0.06, 0.5))
    part("box", T("orange"), loc=(-0.1, -0.12, 1.95), size=(0.2, 0.3, 0.3), bevel=0.01)
    part("box", T("cyan"), loc=(0.12, 0.15, 1.83), size=(0.12, 0.12, 0.06), bevel=0.01)


def p_stove():
    part("box", T("slate"), loc=(0, 0, 0.45), size=(0.72, 0.72, 0.9), bevel=0.02)
    part("box", T("ink"), loc=(0, 0, 0.905), size=(0.66, 0.66, 0.01), outline=False)
    for k, (sx, sy) in enumerate([(1, 1), (1, -1), (-1, 1), (-1, -1)]):
        part("cyl", T("steel"), loc=(0.15 * sx, 0.16 * sy, 0.92), size=(0.22, 0.22, 0.03), seg=10, outline=False)
        if k == 1:
            part("cyl", E("orange"), loc=(0.15 * sx, 0.16 * sy, 0.94), size=(0.12, 0.12, 0.01), seg=10,
                 outline=False)
    part("box", T("slate"), loc=(-0.33, 0, 1.0), size=(0.08, 0.72, 0.2))
    part("box", E("cyan"), loc=(-0.33, 0, 1.105), size=(0.04, 0.16, 0.01), outline=False)
    for y in (-0.24, -0.08, 0.08, 0.24):
        part("cyl", T("grey"), loc=(0.37, y, 0.8), size=(0.06, 0.06, 0.04), rot=(0, 90, 0), seg=6, outline=False)


def p_window():
    part("box", T("bone"), loc=(0, 0, 0.03), size=(0.3, 1.4, 0.06))
    part("box", E("cyan"), loc=(0, 0, 0.065), size=(0.08, 1.28, 0.01), outline=False)
    part("box", T("bone"), loc=(0, 0, 0.07), size=(0.12, 0.05, 0.02), outline=False)
    for sy in (1, -1):
        part("box", T("bone"), loc=(0, 0.66 * sy, 0.08), size=(0.3, 0.08, 0.04), outline=False)


def p_front_door():
    for sy in (1, -1):
        part("box", T("wood3"), loc=(0, 0.53 * sy, 0.06), size=(0.22, 0.06, 0.12))
    part("box", T("maroon"), loc=(0, 0, 0.05), size=(0.1, 1.0, 0.1))
    for sx in (1, -1):
        part("sphere", T("yellow"), loc=(0.07 * sx, -0.38, 0.06), size=0.06, seg=6, rings=4, outline=False)


def p_rug():
    part("box", T("night"), loc=(0, 0, 0.01), size=(2.0, 1.4, 0.02))
    part("box", T("magenta"), loc=(0, 0, 0.012), size=(1.88, 1.28, 0.024), outline=False)
    part("box", T("night"), loc=(0, 0, 0.014), size=(1.8, 1.2, 0.028), outline=False)
    part("box", T("cyan"), loc=(0, 0, 0.016), size=(0.62, 0.62, 0.032), rot=(0, 0, 45), outline=False)
    part("box", T("night"), loc=(0, 0, 0.018), size=(0.46, 0.46, 0.036), rot=(0, 0, 45), outline=False)
    part("box", T("magenta"), loc=(0, 0, 0.02), size=(0.2, 0.2, 0.04), rot=(0, 0, 45), outline=False)
    for sx in (1, -1):
        part("box", T("cyan"), loc=(0.7 * sx, 0, 0.016), size=(0.04, 0.9, 0.032), outline=False)


def p_plant():
    part("cyl", T("clay"), loc=(0, 0, 0.17), size=(0.28, 0.28, 0.35), taper=1.3, seg=10)
    part("cyl", T("wood3"), loc=(0, 0, 0.35), size=(0.33, 0.33, 0.02), seg=10, outline=False)
    for k in range(7):
        a = k * 360 / 7
        r = math.radians(a)
        part("sphere", T("leaf" if k % 2 else "green"), loc=(0.17 * math.cos(r), 0.17 * math.sin(r), 0.5),
             size=(0.38, 0.13, 0.05), rot=(0, -20, a), seg=6, rings=4)
    for k in range(4):
        a = 25 + k * 90
        r = math.radians(a)
        part("sphere", T("leaf"), loc=(0.09 * math.cos(r), 0.09 * math.sin(r), 0.6),
             size=(0.24, 0.1, 0.05), rot=(0, -35, a), seg=6, rings=4)


def p_beer():
    part("cyl", T("amber"), loc=(-0.07, 0, 0.08), size=(0.16, 0.16, 0.3), rot=(0, 90, 0), seg=10)
    part("cyl", T("bone"), loc=(-0.07, 0, 0.08), size=(0.166, 0.166, 0.14), rot=(0, 90, 0), seg=10, outline=False)
    part("cyl", T("amber"), loc=(0.12, 0, 0.08), size=(0.16, 0.16, 0.08), taper=0.4, rot=(0, 90, 0), seg=10)
    part("cyl", T("amber"), loc=(0.21, 0, 0.08), size=(0.065, 0.065, 0.1), rot=(0, 90, 0), seg=8)
    part("cyl", T("yellow"), loc=(0.27, 0, 0.08), size=(0.075, 0.075, 0.03), rot=(0, 90, 0), seg=8)


def p_water():
    part("cyl", T("tile"), loc=(0, 0, 0.15), size=(0.22, 0.22, 0.3), taper=1.2, seg=12)
    part("cyl", T("cyan"), loc=(0, 0, 0.26), size=(0.23, 0.23, 0.01), seg=12, outline=False)
    part("box", T("bone"), loc=(0.03, -0.03, 0.27), size=(0.07, 0.07, 0.04), rot=(0, 0, 20), outline=False)


def p_snacks():
    part("cyl", T("orange"), loc=(0, 0, 0.08), size=(0.3, 0.3, 0.15), taper=1.5, seg=12)
    pts = [(0.0, 0.0, 10), (0.08, 0.05, 50), (-0.07, 0.07, 120), (-0.06, -0.08, 80), (0.07, -0.07, 160),
           (0.12, 0.0, 30), (-0.12, -0.01, 140), (0.0, 0.12, 70), (0.01, -0.12, 100)]
    for x, y, a in pts:
        part("box", T("yellow"), loc=(x, y, 0.16), size=(0.09, 0.07, 0.02), rot=(8, 0, a), outline=False)


def p_kettle():
    part("cyl", T("grey"), loc=(0, 0, 0.18), size=(0.4, 0.4, 0.3), taper=0.75, seg=12)
    part("cyl", T("grey"), loc=(0, 0, 0.36), size=(0.28, 0.28, 0.06), taper=0.6, seg=12)
    part("sphere", T("magenta"), loc=(0, 0, 0.41), size=0.07, seg=6, rings=4)
    part("cyl", T("grey"), loc=(0.25, 0, 0.24), size=(0.1, 0.1, 0.22), taper=0.5, rot=(0, 55, 0), seg=8)
    part("box", T("magenta"), loc=(-0.24, 0, 0.3), size=(0.1, 0.06, 0.04))
    part("box", T("magenta"), loc=(-0.23, 0, 0.12), size=(0.08, 0.06, 0.04))
    part("box", T("magenta"), loc=(-0.28, 0, 0.21), size=(0.04, 0.06, 0.2))


def p_mushrooms():
    for (x, y), s in [((0.05, 0.07), 1.0), ((-0.08, -0.04), 0.8), ((0.09, -0.1), 0.7)]:
        part("cyl", T("bone"), loc=(x, y, 0.05 * s), size=(0.06 * s, 0.06 * s, 0.1 * s), seg=6)
        part("sphere", T("magenta"), loc=(x, y, 0.12 * s), size=(0.2 * s, 0.2 * s, 0.12 * s), seg=10, rings=5)
        for k in range(3):
            r = math.radians(k * 120 + 30)
            part("sphere", T("bone"), loc=(x + 0.05 * s * math.cos(r), y + 0.05 * s * math.sin(r), 0.17 * s),
                 size=0.035 * s, seg=4, rings=3, outline=False)


def p_joint():
    part("cyl", T("bone"), loc=(0.0, 0, 0.05), size=(0.065, 0.065, 0.44), taper=1.5, rot=(0, 90, 0), seg=8)
    part("cyl", T("amber"), loc=(-0.25, 0, 0.05), size=(0.065, 0.065, 0.07), rot=(0, 90, 0), seg=8)
    part("cyl", T("grey"), loc=(0.23, 0, 0.05), size=(0.1, 0.1, 0.03), rot=(0, 90, 0), seg=8, outline=False)
    part("cyl", E("orange"), loc=(0.25, 0, 0.05), size=(0.08, 0.08, 0.02), rot=(0, 90, 0), seg=8)


def _neon_door(key, symbol):
    part("box", T("night"), loc=(0, 0, 0.06), size=(0.12, 1.1, 0.12))
    for sy in (1, -1):
        part("box", E(key), loc=(0, 0.57 * sy, 0.075), size=(0.25, 0.06, 0.15))
    for sx in (1, -1):
        part("box", E(key), loc=(0.11 * sx, 0, 0.07), size=(0.04, 1.2, 0.14))
    if symbol == "circle":
        part("cyl", E(key), loc=(0, 0, 0.13), size=(0.14, 0.14, 0.01), seg=12, outline=False)
    elif symbol == "triangle":
        part("cyl", E(key), loc=(0, 0, 0.13), size=(0.15, 0.15, 0.01), seg=3, outline=False)
    elif symbol == "square":
        part("box", E(key), loc=(0, 0, 0.13), size=(0.1, 0.1, 0.01), outline=False)
    else:
        part("box", E(key), loc=(0, 0, 0.13), size=(0.11, 0.11, 0.01), rot=(0, 0, 45), outline=False)


def p_door_neon_a():
    _neon_door("cyan", "circle")


def p_door_neon_b():
    _neon_door("magenta", "diamond")


def p_painting():
    part("box", T("amber"), loc=(0, 0, 0.025), size=(0.75, 1.0, 0.05))
    part("box", T("night"), loc=(0, 0, 0.03), size=(0.63, 0.88, 0.06), outline=False)
    part("cyl", E("magenta"), loc=(0.1, 0.18, 0.065), size=(0.3, 0.3, 0.01), seg=16, outline=False)
    part("box", E("cyan"), loc=(-0.08, -0.15, 0.067), size=(0.2, 0.36, 0.01), rot=(0, 0, 18), outline=False)
    part("cyl", E("purple"), loc=(-0.12, 0.2, 0.069), size=(0.26, 0.26, 0.01), seg=3, outline=False)
    part("box", E("yellow"), loc=(0.17, -0.28, 0.071), size=(0.08, 0.08, 0.01), outline=False)


# ---- extra furniture (fixed in-game pixel sizes, see PROP_SIZES) ----

BOOK_COLS = ["magenta", "cyan", "violet", "amber", "bone", "leaf", "maroon", "yellow", "denim", "purple"]


def p_bookshelf():
    part("box", T("wood3"), loc=(0, 0, 0.05), size=(0.74, 2.34, 0.1))
    part("box", T("wood3"), loc=(-0.33, 0, 0.8), size=(0.08, 2.34, 1.6))
    for sy in (1, -1):
        part("box", T("wood3"), loc=(0, 1.13 * sy, 0.8), size=(0.74, 0.08, 1.6))
    part("box", T("wood3"), loc=(0, 0, 0.8), size=(0.6, 0.05, 1.5), outline=False)
    y, k = -1.07, 0
    widths = [0.09, 0.07, 0.11, 0.08, 0.06, 0.1, 0.08, 0.12, 0.07, 0.09, 0.08, 0.1]
    while y < 1.05:
        w = widths[k % len(widths)]
        if abs(y + w / 2) < 0.06:  # skip the middle divider
            y += 0.06
            continue
        if k == 7:  # a book lying flat across the gap
            part("box", T(BOOK_COLS[k % 10]), loc=(0.02, y + 0.12, 1.1), size=(0.5, 0.26, 0.06), outline=False)
            y += 0.28
        else:
            h = 1.2 + 0.08 * ((k * 7) % 4)
            part("box", T(BOOK_COLS[k % 10]), loc=(0.02 + 0.03 * (k % 2), y + w / 2, h / 2),
                 size=(0.55 - 0.05 * (k % 3), w - 0.01, h), outline=False)
            y += w
        k += 1


def p_dresser():
    part("box", T("wood2"), loc=(0, 0, 0.45), size=(0.7, 1.74, 0.9), bevel=0.03)
    part("box", T("wood"), loc=(0, 0, 0.905), size=(0.62, 1.66, 0.01), outline=False)
    for y in (-0.5, 0.5):
        part("sphere", T("yellow"), loc=(0.36, y, 0.6), size=0.06, seg=6, rings=4, outline=False)
    part("box", T("bone"), loc=(-0.12, 0.45, 1.0), size=(0.06, 0.34, 0.26), rot=(0, -10, 0))
    part("box", E("cyan"), loc=(-0.08, 0.45, 1.0), size=(0.01, 0.26, 0.18), rot=(0, -10, 0), outline=False)
    part("box", T("maroon"), loc=(0.05, -0.35, 0.96), size=(0.22, 0.3, 0.12), bevel=0.02)
    part("cyl", T("magenta"), loc=(0.12, 0.0, 0.98), size=(0.1, 0.1, 0.16), seg=8)
    part("cyl", T("grey"), loc=(0.12, 0.0, 1.07), size=(0.04, 0.04, 0.04), seg=6, outline=False)


def p_nightstand():
    part("box", T("wood"), loc=(0, 0, 0.25), size=(0.56, 0.56, 0.5), bevel=0.03)
    part("sphere", T("yellow"), loc=(0.29, 0, 0.32), size=0.05, seg=6, rings=4, outline=False)
    part("cyl", T("slate"), loc=(-0.06, 0.06, 0.55), size=(0.12, 0.12, 0.1), seg=8)
    part("cyl", T("bone"), loc=(-0.06, 0.06, 0.74), size=(0.34, 0.34, 0.2), taper=0.65, seg=10)
    part("cyl", E("yellow"), loc=(-0.06, 0.06, 0.845), size=(0.2, 0.2, 0.01), seg=10, outline=False)
    part("box", T("ink"), loc=(0.14, -0.14, 0.51), size=(0.16, 0.09, 0.02), rot=(0, 0, 20), outline=False)


def p_armchair():
    part("box", T("plum"), loc=(0, 0, 0.2), size=(1.06, 1.06, 0.35), bevel=0.05)
    part("box", T("plum"), loc=(-0.4, 0, 0.45), size=(0.26, 1.06, 0.75), bevel=0.06)
    for sy in (1, -1):
        part("box", T("plum"), loc=(0, 0.43 * sy, 0.32), size=(1.06, 0.2, 0.55), bevel=0.05)
    part("box", T("violet"), loc=(0.08, 0, 0.44), size=(0.68, 0.64, 0.14), bevel=0.04)
    part("box", T("cyan"), loc=(-0.18, 0.12, 0.56), size=(0.24, 0.3, 0.12), rot=(0, 0, -15), bevel=0.04)


def p_floor_lamp():
    part("cyl", T("slate"), loc=(0, 0, 0.02), size=(0.3, 0.3, 0.04), seg=10)
    part("cyl", T("slate"), loc=(0, 0, 0.75), size=(0.04, 0.04, 1.4), seg=6, outline=False)
    part("cyl", T("bone"), loc=(0, 0, 1.55), size=(0.44, 0.44, 0.3), taper=0.7, seg=12)
    part("cyl", E("orange"), loc=(0, 0, 1.703), size=(0.3, 0.3, 0.005), seg=12, outline=False)
    part("cyl", E("yellow"), loc=(0, 0, 1.705), size=(0.22, 0.22, 0.01), seg=12, outline=False)
    part("sphere", E("bone"), loc=(0, 0, 1.68), size=0.1, seg=6, rings=4, outline=False)


def p_desk():
    part("box", T("wood2"), loc=(0, 0, 0.75), size=(0.94, 1.98, 0.06), bevel=0.02)
    for sy in (1, -1):
        part("box", T("wood3"), loc=(0, 0.9 * sy, 0.37), size=(0.86, 0.06, 0.72))
    part("box", T("slate"), loc=(-0.3, 0, 0.79), size=(0.16, 0.26, 0.02), outline=False)
    part("box", T("ink"), loc=(-0.32, 0, 1.1), size=(0.06, 0.92, 0.52), bevel=0.01)
    part("box", E("cyan"), loc=(-0.285, 0, 1.36), size=(0.012, 0.86, 0.01), outline=False)
    part("box", E("cyan"), loc=(-0.288, 0, 1.1), size=(0.006, 0.86, 0.46), outline=False)
    part("box", T("ink"), loc=(0.14, -0.05, 0.79), size=(0.2, 0.62, 0.02), bevel=0.005)
    part("sphere", T("bone"), loc=(0.16, 0.44, 0.79), size=(0.1, 0.07, 0.04), seg=6, rings=4)
    part("cyl", T("magenta"), loc=(0.05, -0.72, 0.83), size=(0.12, 0.12, 0.14), seg=8)
    part("cyl", T("wood3"), loc=(0.05, -0.72, 0.9), size=(0.09, 0.09, 0.01), seg=8, outline=False)
    for k, a in enumerate((12, -8)):
        part("box", T("bone"), loc=(0.22 - 0.03 * k, 0.72, 0.785 + 0.004 * k), size=(0.3, 0.22, 0.004),
             rot=(0, 0, a), outline=False)


def p_chair():
    part("box", T("slate"), loc=(0, 0, 0.42), size=(0.5, 0.5, 0.08), bevel=0.02)
    part("box", T("violet"), loc=(0.03, 0, 0.47), size=(0.4, 0.42, 0.04), bevel=0.01, outline=False)
    part("box", T("slate"), loc=(-0.23, 0, 0.7), size=(0.08, 0.5, 0.5), bevel=0.02)
    for sx in (1, -1):
        for sy in (1, -1):
            part("cyl", T("ink"), loc=(0.2 * sx, 0.2 * sy, 0.2), size=(0.05, 0.05, 0.4), seg=4, outline=False)


def p_speaker():
    part("box", T("ink"), loc=(0, 0, 0.45), size=(0.42, 0.42, 0.9), bevel=0.03)
    part("cyl", T("slate"), loc=(0, 0, 0.905), size=(0.28, 0.28, 0.01), seg=12, outline=False)
    part("cyl", T("steel"), loc=(0, 0, 0.91), size=(0.12, 0.12, 0.01), seg=10, outline=False)
    part("box", E("magenta"), loc=(0.19, 0, 0.905), size=(0.02, 0.34, 0.01), outline=False)


def p_guitar():
    part("cyl", T("amber"), loc=(0, -0.5, 0.05), size=(0.38, 0.38, 0.1), seg=14)
    part("cyl", T("amber"), loc=(0, -0.2, 0.05), size=(0.3, 0.3, 0.1), seg=12)
    part("cyl", T("ink"), loc=(0, -0.28, 0.101), size=(0.11, 0.11, 0.005), seg=10, outline=False)
    part("box", T("wood3"), loc=(0, -0.55, 0.102), size=(0.14, 0.04, 0.01), outline=False)
    part("box", T("wood3"), loc=(0, 0.23, 0.07), size=(0.08, 0.54, 0.04))
    part("box", T("wood3"), loc=(0, 0.6, 0.07), size=(0.12, 0.2, 0.04))
    part("box", T("bone"), loc=(0, 0.02, 0.108), size=(0.03, 1.1, 0.004), outline=False)
    for sx in (1, -1):
        for y in (0.55, 0.65):
            part("box", T("grey"), loc=(0.075 * sx, y, 0.07), size=(0.03, 0.03, 0.03), outline=False)


def p_bathtub():
    part("box", T("bone"), loc=(0, 0, 0.28), size=(1.2, 2.6, 0.55), bevel=0.08)
    part("box", T("tile"), loc=(0.02, 0.06, 0.556), size=(0.92, 2.3, 0.01), outline=False)
    part("box", T("cyan"), loc=(0.02, 0.1, 0.558), size=(0.84, 2.14, 0.01), outline=False)
    for x, y, s in [(0.25, 0.8, 0.14), (0.15, 0.9, 0.1), (-0.2, 0.75, 0.12), (0.0, 1.0, 0.09), (-0.28, 0.98, 0.08)]:
        part("ico", T("bone"), loc=(x, y, 0.57), size=(s, s, s * 0.5), outline=False)
    part("box", T("steel"), loc=(0, -1.2, 0.66), size=(0.08, 0.2, 0.06))
    for sx in (1, -1):
        part("cyl", T("steel"), loc=(0.16 * sx, -1.24, 0.64), size=(0.08, 0.08, 0.06), seg=6, outline=False)
    part("sphere", T("yellow"), loc=(-0.15, 0.25, 0.6), size=(0.16, 0.12, 0.1), seg=8, rings=5)
    part("sphere", T("yellow"), loc=(-0.08, 0.25, 0.66), size=0.08, seg=6, rings=4, outline=False)
    part("box", T("orange"), loc=(-0.02, 0.25, 0.66), size=(0.04, 0.04, 0.02), outline=False)


def p_washer():
    part("box", T("bone"), loc=(0, 0, 0.42), size=(0.82, 0.82, 0.85), bevel=0.04)
    part("box", T("slate"), loc=(-0.31, 0, 0.86), size=(0.18, 0.8, 0.06))
    part("box", E("cyan"), loc=(-0.31, 0.16, 0.895), size=(0.08, 0.2, 0.01), outline=False)
    part("cyl", T("steel"), loc=(-0.31, -0.2, 0.9), size=(0.11, 0.11, 0.03), seg=8, outline=False)
    part("cyl", T("grey"), loc=(0.08, 0, 0.855), size=(0.52, 0.52, 0.01), seg=14, outline=False)
    part("cyl", T("denim"), loc=(0.08, 0, 0.86), size=(0.38, 0.38, 0.01), seg=14, outline=False)


def p_cabinet():
    part("box", T("bone"), loc=(0, 0, 1.6), size=(0.5, 1.12, 0.6), bevel=0.03)
    part("box", T("tile"), loc=(0, 0, 1.905), size=(0.42, 1.04, 0.01), outline=False)
    part("cyl", T("cyan"), loc=(0.02, -0.3, 1.97), size=(0.12, 0.12, 0.14), seg=8)
    part("box", T("magenta"), loc=(0.03, -0.28, 2.06), size=(0.03, 0.03, 0.12), rot=(15, 0, 0), outline=False)
    part("box", T("leaf"), loc=(0.0, 0.05, 1.94), size=(0.14, 0.22, 0.08), bevel=0.02)
    part("cyl", T("orange"), loc=(0.02, 0.35, 1.97), size=(0.1, 0.1, 0.14), seg=8)


def p_counter():
    part("box", T("slate"), loc=(0, 0, 0.42), size=(0.72, 2.66, 0.85))
    part("box", T("grey"), loc=(0, 0, 0.87), size=(0.77, 2.71, 0.05))
    part("box", T("wood2"), loc=(0.06, 0.45, 0.91), size=(0.38, 0.6, 0.03), bevel=0.01)
    part("box", T("steel"), loc=(0.1, 0.55, 0.93), size=(0.04, 0.3, 0.01), rot=(0, 0, 10), outline=False)
    part("box", T("wood3"), loc=(0.1, 0.36, 0.93), size=(0.05, 0.1, 0.02), rot=(0, 0, 10), outline=False)
    part("sphere", T("red"), loc=(-0.03, 0.28, 0.96), size=0.11, seg=8, rings=5)
    part("sphere", T("leaf"), loc=(0.03, 0.62, 0.94), size=(0.12, 0.08, 0.04), seg=6, rings=4, outline=False)
    for y, lid in [(-1.1, "magenta"), (-0.88, "cyan"), (-0.66, "yellow")]:
        part("cyl", T("tile"), loc=(-0.2, y, 1.0), size=(0.16, 0.16, 0.22), seg=6)
        part("cyl", T(lid), loc=(-0.2, y, 1.12), size=(0.17, 0.17, 0.03), seg=6, outline=False)
    part("cyl", T("orange"), loc=(0.05, -0.2, 0.94), size=(0.3, 0.3, 0.1), taper=1.3, seg=8)
    for x, y in [(0.02, -0.18), (0.09, -0.24), (0.05, -0.12)]:
        part("sphere", T("yellow"), loc=(x, y, 1.01), size=0.08, seg=6, rings=4, outline=False)


def p_dining_table():
    part("box", T("wood2"), loc=(0, 0, 0.75), size=(1.38, 2.02, 0.06), bevel=0.02)
    for sx in (1, -1):
        for sy in (1, -1):
            part("cyl", T("wood3"), loc=(0.6 * sx, 0.9 * sy, 0.37), size=(0.08, 0.08, 0.74), seg=6, outline=False)
    for sx in (1, -1):
        for sy in (1, -1):
            part("cyl", T("bone"), loc=(0.4 * sx, 0.55 * sy, 0.785), size=(0.34, 0.34, 0.01), seg=8)
            part("cyl", T("tile"), loc=(0.4 * sx, 0.55 * sy, 0.79), size=(0.22, 0.22, 0.01), seg=8,
                 outline=False)
            part("box", T("steel"), loc=(0.4 * sx, 0.55 * sy - 0.22, 0.785), size=(0.2, 0.025, 0.01),
                 outline=False)
    part("cyl", T("leaf"), loc=(0, 0.08, 0.95), size=(0.12, 0.12, 0.34), seg=8)
    part("cyl", T("yellow"), loc=(0, 0.08, 1.13), size=(0.05, 0.05, 0.04), seg=6, outline=False)
    part("cyl", T("magenta"), loc=(0, -0.15, 0.86), size=(0.1, 0.1, 0.18), seg=8)
    part("sphere", E("orange"), loc=(0, -0.15, 0.97), size=0.05, seg=6, rings=4, outline=False)


def p_shoe_rack():
    part("box", T("wood3"), loc=(0, 0, 0.17), size=(0.4, 1.42, 0.35))
    for y, col in [(-0.52, "magenta"), (-0.17, "bone"), (0.17, "ink"), (0.52, "cyan")]:
        for d in (-0.065, 0.065):
            part("box", T(col), loc=(0.02, y + d, 0.39), size=(0.3, 0.1, 0.09), bevel=0.02)


def p_coat_rack():
    part("cyl", T("wood3"), loc=(0, 0, 0.9), size=(0.05, 0.05, 1.8), seg=6, outline=False)
    for k in range(4):
        a = math.radians(45 + 90 * k)
        part("box", T("wood3"), loc=(0.07 * math.cos(a), 0.07 * math.sin(a), 1.7), size=(0.15, 0.03, 0.03),
             rot=(0, 0, 45 + 90 * k), outline=False)
    for a, col in [(200, "plum"), (330, "denim"), (90, "maroon")]:
        r = math.radians(a)
        part("sphere", T(col), loc=(0.11 * math.cos(r), 0.11 * math.sin(r), 1.3),
             size=(0.16, 0.18, 0.5), rot=(0, 0, a), seg=8, rings=5)
    part("cyl", T("ink"), loc=(0, 0, 1.85), size=(0.24, 0.24, 0.03), seg=10)
    part("cyl", T("ink"), loc=(0, 0, 1.9), size=(0.14, 0.14, 0.1), seg=10)
    part("cyl", T("magenta"), loc=(0, 0, 1.87), size=(0.15, 0.15, 0.025), seg=10, outline=False)


def p_trash():
    part("cyl", T("steel"), loc=(0, 0, 0.25), size=(0.26, 0.26, 0.5), taper=1.2, seg=10)
    part("cyl", T("ink"), loc=(0, 0, 0.5), size=(0.28, 0.28, 0.03), seg=10, outline=False)
    part("ico", T("bone"), loc=(0.03, 0.02, 0.54), size=0.11, outline=False)
    part("ico", T("orange"), loc=(-0.05, -0.04, 0.53), size=0.07, outline=False)


def p_pizza_box():
    part("box", T("bone"), loc=(0, 0, 0.03), size=(0.62, 0.62, 0.06))
    part("cyl", T("magenta"), loc=(0, 0.04, 0.061), size=(0.3, 0.3, 0.004), seg=14, outline=False)
    part("cyl", T("bone"), loc=(0, 0.04, 0.062), size=(0.2, 0.2, 0.004), seg=12, outline=False)
    part("cyl", T("red"), loc=(0, 0.04, 0.063), size=(0.14, 0.14, 0.004), seg=3, rot=(0, 0, 30), outline=False)
    part("box", T("magenta"), loc=(0, -0.2, 0.061), size=(0.3, 0.05, 0.004), outline=False)
    part("cyl", T("amber"), loc=(0.17, 0.18, 0.061), size=(0.1, 0.07, 0.003), seg=8, outline=False)


def p_ashtray():
    part("cyl", T("slate"), loc=(0, 0, 0.025), size=(0.27, 0.27, 0.05), seg=10)
    part("cyl", T("ink"), loc=(0, 0, 0.051), size=(0.19, 0.19, 0.003), seg=10, outline=False)
    part("cyl", T("bone"), loc=(0.02, 0.03, 0.06), size=(0.03, 0.03, 0.12), rot=(0, 90, 20), seg=4, outline=False)
    part("cyl", T("amber"), loc=(-0.03, -0.03, 0.06), size=(0.03, 0.03, 0.08), rot=(0, 90, -50), seg=4,
         outline=False)
    part("box", E("orange"), loc=(0.08, 0.05, 0.065), size=(0.03, 0.03, 0.01), outline=False)


def p_bottles():
    for y, d, col in [(0.065, 1, "leaf"), (-0.065, -1, "amber")]:
        part("cyl", T(col), loc=(-0.04 * d, y, 0.05), size=(0.1, 0.1, 0.22), rot=(0, 90 * d, 0), seg=8)
        part("cyl", T(col), loc=(0.11 * d, y, 0.05), size=(0.1, 0.1, 0.06), taper=0.45, rot=(0, 90 * d, 0), seg=8)
        part("cyl", T(col), loc=(0.17 * d, y, 0.05), size=(0.045, 0.045, 0.07), rot=(0, 90 * d, 0), seg=6)
        part("cyl", T("bone"), loc=(-0.04 * d, y, 0.05), size=(0.104, 0.104, 0.08), rot=(0, 90 * d, 0), seg=8,
             outline=False)


# ---- batch 3: held items, open states, maze decor ----

def p_knife():
    part("box", T("maroon"), loc=(-0.18, 0, 0.03), size=(0.2, 0.09, 0.05), bevel=0.015)
    part("box", T("slate"), loc=(-0.07, 0, 0.03), size=(0.03, 0.12, 0.05))
    part("box", T("grey"), loc=(0.08, 0, 0.02), size=(0.28, 0.07, 0.015))
    part("box", T("grey"), loc=(0.22, 0, 0.02), size=(0.05, 0.05, 0.015), rot=(0, 0, 45))
    part("box", E("bone"), loc=(0.08, 0.025, 0.03), size=(0.26, 0.012, 0.004), outline=False)


def p_cup():
    part("cyl", T("magenta"), loc=(0, 0, 0.09), size=(0.2, 0.2, 0.18), seg=10)
    part("cyl", T("wood3"), loc=(0, 0, 0.181), size=(0.15, 0.15, 0.004), seg=10, outline=False)
    part("box", T("magenta"), loc=(0, -0.115, 0.1), size=(0.05, 0.04, 0.1))


def p_juice():
    part("box", T("orange"), loc=(0, 0, 0.25), size=(0.22, 0.34, 0.5))
    part("box", T("bone"), loc=(0, 0, 0.505), size=(0.22, 0.34, 0.02), outline=False)
    part("box", T("bone"), loc=(0, 0, 0.54), size=(0.05, 0.34, 0.06))
    part("cyl", E("yellow"), loc=(0, -0.09, 0.517), size=(0.1, 0.1, 0.004), seg=8, outline=False)
    part("cyl", T("green"), loc=(0.05, 0.1, 0.56), size=(0.03, 0.03, 0.12), seg=4, outline=False)


def p_food():
    part("cyl", T("bone"), loc=(0, 0, 0.015), size=(0.56, 0.56, 0.03), seg=14)
    part("cyl", T("tile"), loc=(0, 0, 0.031), size=(0.42, 0.42, 0.003), seg=14, outline=False)
    part("cyl", T("bone"), loc=(0.07, 0.08, 0.04), size=(0.18, 0.16, 0.015), seg=8, outline=False)
    part("sphere", T("yellow"), loc=(0.07, 0.08, 0.05), size=(0.07, 0.07, 0.04), seg=6, rings=4, outline=False)
    for dx in (0.0, 0.06):
        part("cyl", T("wood2"), loc=(-0.08 + dx, -0.06 - dx * 0.4, 0.05), size=(0.055, 0.055, 0.2),
             rot=(0, 90, 30), seg=6, outline=False)
    for x, y in [(-0.12, 0.1), (-0.06, 0.15), (-0.15, 0.03)]:
        part("ico", T("leaf"), loc=(x, y, 0.05), size=0.08, outline=False)
    for x, y in [(0.12, -0.1), (0.05, -0.15)]:
        part("cyl", T("red"), loc=(x, y, 0.045), size=(0.08, 0.08, 0.015), seg=8, outline=False)


def p_fridge_open():
    """Cutaway: top removed so the lit interior shows; door ajar on its +Y hinge."""
    part("box", T("bone"), loc=(-0.33, 0, 0.9), size=(0.06, 0.72, 1.8))
    for sy in (1, -1):
        part("box", T("bone"), loc=(0, 0.33 * sy, 0.9), size=(0.72, 0.06, 1.8))
    part("box", E("bone"), loc=(0.0, 0, 1.2), size=(0.62, 0.6, 0.01), outline=False)
    part("sphere", E("yellow"), loc=(-0.24, 0.18, 1.3), size=0.1, seg=6, rings=4, outline=False)
    part("cyl", T("leaf"), loc=(-0.15, -0.18, 1.35), size=(0.12, 0.12, 0.3), seg=8, outline=False)
    part("box", T("orange"), loc=(0.1, -0.12, 1.3), size=(0.18, 0.14, 0.2), outline=False)
    part("cyl", T("magenta"), loc=(0.12, 0.15, 1.27), size=(0.13, 0.13, 0.14), seg=8, outline=False)
    for k in range(3):
        part("sphere", T("bone"), loc=(-0.1 + 0.07 * k, 0.05, 1.24), size=0.06, seg=6, rings=4, outline=False)
    hx, hy, Lw = 0.36, 0.36, 0.72
    a = math.radians(3)
    part("box", T("bone"), loc=(hx - 0.02 + math.sin(a) * Lw / 2, hy - math.cos(a) * Lw / 2, 0.9),
         size=(0.04, Lw, 1.8), rot=(0, 0, 3))
    part("box", E("yellow"), loc=(0.355, -0.05, 1.81), size=(0.012, 0.56, 0.01), rot=(0, 0, 3), outline=False)


def p_wardrobe_open():
    """Cutaway: top removed to show clothes on the rail; both doors ajar."""
    part("box", T("wood"), loc=(-0.27, 0, 0.9), size=(0.06, 1.6, 1.8))
    for sy in (1, -1):
        part("box", T("wood"), loc=(0, 0.77 * sy, 0.9), size=(0.6, 0.06, 1.8))
    part("box", T("wood3"), loc=(0, 0, 0.1), size=(0.54, 1.48, 0.2), outline=False)
    part("box", T("ink"), loc=(-0.05, 0, 1.7), size=(0.03, 1.48, 0.03), outline=False)
    cols = ["magenta", "denim", "bone", "plum", "cyan", "maroon", "slate", "violet", "yellow", "ink", "leaf"]
    y = -0.66
    for k, col in enumerate(cols):
        w = 0.1 + 0.02 * (k % 3)
        part("box", T(col), loc=(-0.05, y + w / 2, 1.15), size=(0.38 - 0.06 * (k % 2), w - 0.015, 1.0),
             outline=False)
        y += w
    for sy in (1, -1):
        a = math.radians(6)
        part("box", T("wood"), loc=(0.3 + math.sin(a) * 0.39, sy * (0.8 - math.cos(a) * 0.39), 0.9),
             size=(0.04, 0.78, 1.8), rot=(0, 0, 6 * sy))


def p_window_open():
    """Sash slid over: one half is double glass, the other half open with a curtain."""
    part("box", T("bone"), loc=(0, 0, 0.03), size=(0.3, 1.4, 0.06))
    part("box", E("ink"), loc=(0, 0.32, 0.065), size=(0.08, 0.62, 0.01), outline=False)
    part("box", E("cyan"), loc=(-0.025, -0.32, 0.065), size=(0.05, 0.62, 0.01), outline=False)
    part("box", E("cyan"), loc=(0.03, -0.3, 0.07), size=(0.04, 0.62, 0.01), outline=False)
    part("box", T("bone"), loc=(0, 0.0, 0.07), size=(0.12, 0.05, 0.02), outline=False)
    for sy in (1, -1):
        part("box", T("bone"), loc=(0, 0.66 * sy, 0.08), size=(0.3, 0.08, 0.04), outline=False)
    for k, y in enumerate((0.1, 0.22, 0.34, 0.46, 0.56)):
        part("box", T("magenta"), loc=(0.03 * (-1) ** k, y, 0.1), size=(0.05, 0.12, 0.02),
             rot=(0, 0, 25 * (-1) ** k), outline=False)


def p_front_door_open():
    """Doorway with the door swung away: jambs, empty opening and warm light on the sill."""
    for sy in (1, -1):
        part("box", T("wood3"), loc=(0, 0.53 * sy, 0.06), size=(0.22, 0.06, 0.12))
    part("box", T("wood3"), loc=(0, 0, 0.005), size=(0.12, 1.0, 0.01))
    part("box", E("yellow"), loc=(0.02, 0, 0.012), size=(0.05, 0.92, 0.004), outline=False)
    part("box", T("maroon"), loc=(0, -0.46, 0.06), size=(0.1, 0.06, 0.1), outline=False)


def p_candle():
    part("cyl", T("slate"), loc=(0, 0, 0.015), size=(0.26, 0.26, 0.03), seg=10)
    part("cyl", T("bone"), loc=(0, 0, 0.14), size=(0.12, 0.12, 0.22), seg=8)
    part("sphere", T("bone"), loc=(0.05, 0.02, 0.2), size=(0.04, 0.04, 0.08), seg=4, rings=3, outline=False)
    part("sphere", E("orange"), loc=(0, 0, 0.28), size=(0.08, 0.08, 0.12), seg=6, rings=4, outline=False)
    part("sphere", E("yellow"), loc=(0, 0, 0.3), size=(0.045, 0.045, 0.08), seg=6, rings=4, outline=False)


def p_clock():
    part("cyl", T("slate"), loc=(0, 0, 0.025), size=(0.52, 0.52, 0.05), seg=16)
    part("cyl", T("bone"), loc=(0, 0, 0.052), size=(0.44, 0.44, 0.004), seg=16, outline=False)
    for k in range(12):
        a = math.radians(k * 30)
        big = k % 3 == 0
        part("box", T("ink" if not big else "magenta"), loc=(0.18 * math.cos(a), 0.18 * math.sin(a), 0.056),
             size=(0.05 if big else 0.03, 0.02, 0.003), rot=(0, 0, k * 30), outline=False)
    part("box", T("ink"), loc=(0, 0.055, 0.06), size=(0.03, 0.11, 0.004), outline=False)
    part("box", T("ink"), loc=(0.08, 0, 0.062), size=(0.16, 0.02, 0.004), outline=False)
    part("cyl", E("magenta"), loc=(0, 0, 0.065), size=(0.04, 0.04, 0.004), seg=6, outline=False)


def p_mirror():
    part("box", T("amber"), loc=(0, 0, 0.02), size=(0.28, 1.0, 0.04))
    part("box", T("tile"), loc=(0, 0, 0.025), size=(0.2, 0.92, 0.04), outline=False)
    for y, ln in [(0.2, 0.3), (0.05, 0.16), (-0.3, 0.22)]:
        part("box", E("bone"), loc=(0, y, 0.047), size=(0.02, ln, 0.003), rot=(0, 0, 25), outline=False)


def p_door_neon_c():
    _neon_door("yellow", "triangle")


def p_door_neon_d():
    _neon_door("green", "square")


def _neon_sign(key, segs):
    """Neon digit on a dark plate; segments in image space (x right, y up)."""
    part("box", T("night"), loc=(0, 0, 0.03), size=(0.72, 0.72, 0.06))
    for x0, y0, x1, y1 in [(-0.32, -0.32, 0.32, -0.3), (-0.32, 0.3, 0.32, 0.32),
                           (-0.32, -0.32, -0.3, 0.32), (0.3, -0.32, 0.32, 0.32)]:
        part("box", E("plum"), loc=((x0 + x1) / 2, (y0 + y1) / 2, 0.062), size=(x1 - x0, y1 - y0, 0.004),
             outline=False)
    for x, y, w, h, r in segs:
        part("box", T("plum"), loc=(x, y, 0.063), size=(w + 0.06, h + 0.06, 0.004), rot=(0, 0, r), outline=False)
    for x, y, w, h, r in segs:
        part("box", E(key), loc=(x, y, 0.066), size=(w, h, 0.004), rot=(0, 0, r), outline=False)


def p_sign_1():
    _neon_sign("magenta", [(0.02, 0.0, 0.07, 0.5, 0), (-0.07, 0.19, 0.16, 0.06, 35), (0.02, -0.25, 0.26, 0.06, 0)])


def p_sign_2():
    _neon_sign("cyan", [(0, 0.25, 0.3, 0.06, 0), (0.12, 0.14, 0.06, 0.24, 0), (0, 0.0, 0.3, 0.06, 0),
                        (-0.12, -0.12, 0.06, 0.24, 0), (0, -0.25, 0.3, 0.06, 0)])


# In-game pixel size (w along X, h along Y) for props that must match the map layout.
PROP_SIZES = {
    "knife": (22, 8), "cup": (12, 12), "juice": (12, 18), "food": (22, 22),
    "fridge_open": (30, 28), "wardrobe_open": (28, 56), "window_open": (14, 50), "front_door_open": (12, 40),
    "candle": (12, 12), "clock": (20, 20), "mirror": (14, 36), "door_neon_c": (12, 44), "door_neon_d": (12, 44),
    "sign_1": (28, 28), "sign_2": (28, 28),
    "bookshelf": (28, 80), "dresser": (26, 60), "nightstand": (22, 22), "armchair": (40, 40),
    "floor_lamp": (18, 18), "desk": (34, 70), "chair": (22, 22), "speaker": (18, 18), "guitar": (16, 50),
    "bathtub": (44, 90), "washer": (30, 30), "cabinet": (20, 40), "counter": (28, 90),
    "dining_table": (50, 70), "shoe_rack": (16, 50), "coat_rack": (18, 18), "trash": (14, 14),
    "pizza_box": (24, 24), "ashtray": (12, 12), "bottles": (18, 12),
}

PROPS = ["bed", "wardrobe", "couch", "table", "tv", "laptop", "toilet", "sink", "fridge", "stove", "window",
         "front_door", "rug", "plant", "beer", "water", "snacks", "kettle", "mushrooms", "joint",
         "door_neon_a", "door_neon_b", "painting"] + list(PROP_SIZES)


# --------------------------------------------------------------- tiles ----
# Each tile is a 1x1 unit square of flat emissive quads. Lines sit on one side
# of each edge only, so the pattern repeats with no seam.

def snap(v):
    return round(v * PX) / PX


def rect(x0, y0, x1, y1, key, z=0.01, rot_z=0.0):
    part("box", E(key), loc=((x0 + x1) / 2, (y0 + y1) / 2, z), size=(x1 - x0, y1 - y0, 0.002),
         rot=(0, 0, rot_z), outline=False)


def wrap_x(x0, x1, y0, y1, key, z):
    """Draw [x0,x1] wrapped into the tile [-0.5, 0.5]."""
    while x0 >= 0.5:
        x0, x1 = x0 - 1, x1 - 1
    if x1 <= 0.5:
        rect(x0, y0, x1, y1, key, z)
    else:
        rect(x0, y0, 0.5, y1, key, z)
        rect(-0.5, y0, x1 - 1, y1, key, z)


def running_rows(rows, colors, z=0.01, highlight=None):
    """rows: list of (y0, height, [seam xs]); bricks between seams, 1px gaps."""
    for r, (y0, hgt, seams) in enumerate(rows):
        ss = sorted(snap(s) for s in seams)
        for k, a in enumerate(ss):
            b = ss[k + 1] if k + 1 < len(ss) else ss[0] + 1
            col = colors[(r + k) % len(colors)]
            wrap_x(a + U, b, y0 + U, y0 + hgt, col, z)
            if highlight:
                wrap_x(a + U, b, y0 + hgt - U, y0 + hgt, highlight, z + 0.005)


def t_wood():
    rect(-0.5, -0.5, 0.5, 0.5, "wood3", 0)
    rows = [(-0.5, 0.25, [-0.22, 0.28]), (-0.25, 0.25, [0.03]), (0.0, 0.25, [-0.34, 0.16]),
            (0.25, 0.25, [-0.06, 0.44])]
    running_rows(rows, ["wood", "wood2"])
    for x, y, w in [(-0.4, -0.38, 0.16), (0.1, -0.12, 0.22), (-0.2, 0.13, 0.12), (0.2, 0.38, 0.18)]:
        rect(snap(x), snap(y), snap(x + w), snap(y) + U, "wood3", 0.02)


def t_bath():
    rect(-0.5, -0.5, 0.5, 0.5, "grey", 0)
    for x0 in (-0.5, 0.0):
        for y0 in (-0.5, 0.0):
            rect(x0 + U, y0 + U, x0 + 0.5, y0 + 0.5, "tile", 0.01)
            rect(x0 + 3 * U, y0 + 0.5 - 4 * U, x0 + 6 * U, y0 + 0.5 - 3 * U, "bone", 0.02)
            rect(x0 + 3 * U, y0 + 0.5 - 6 * U, x0 + 4 * U, y0 + 0.5 - 4 * U, "bone", 0.02)


def t_checker():
    for x0 in (-0.5, 0.0):
        for y0 in (-0.5, 0.0):
            rect(x0, y0, x0 + 0.5, y0 + 0.5, "bone" if (x0 == y0) else "slate", 0)


def t_trip():
    rect(-0.5, -0.5, 0.5, 0.5, "void", 0)
    rect(-0.5, -0.5, 0.5, -0.5 + U, "purple", 0.01)
    rect(-0.5, -0.5, -0.5 + U, 0.5, "purple", 0.01)
    part("box", E("cyan"), loc=(0, 0, 0.02), size=(0.2, 0.2, 0.002), rot=(0, 0, 45), outline=False)
    part("box", E("void"), loc=(0, 0, 0.03), size=(0.1, 0.1, 0.002), rot=(0, 0, 45), outline=False)
    for sx in (1, -1):
        for sy in (1, -1):
            x, y = 0.25 * sx, 0.25 * sy
            rect(x - U / 2 - U / 2, y - U, x + U / 2 + U / 2 - U, y, "magenta", 0.02)


def t_labyrinth():
    rect(-0.5, -0.5, 0.5, 0.5, "void", 0)
    rows = [(-0.5, 0.5, [-0.5, 0.0]), (0.0, 0.5, [-0.25, 0.25])]
    running_rows(rows, ["plum", "night"])
    for x, y, w, h in [(-0.38, -0.3, 6, 1), (-0.2, -0.3, 1, 4), (0.12, 0.2, 7, 1), (0.3, 0.2, 1, -4)]:
        x, y = snap(x), snap(y)
        rect(x, min(y, y + h * U), x + w * U, max(y + U, y + h * U), "violet", 0.02)


def t_wall():
    rect(-0.5, -0.5, 0.5, 0.5, "night", 0)
    rows = [(-0.5, 0.25, [-0.5, 0.0]), (-0.25, 0.25, [-0.25, 0.25]), (0.0, 0.25, [-0.5, 0.0]),
            (0.25, 0.25, [-0.25, 0.25])]
    running_rows(rows, ["slate"], highlight="steel")


TILES = ["wood", "bath", "checker", "trip", "labyrinth", "wall"]


# ---------------------------------------------------------------- build ----

def build():
    wipe()
    G = groups()
    setup_scene(G)
    for cid, spec in CHARS.items():
        build_human(cid, spec, G)
    build_boss(G)
    for pid in PROPS:
        c = get_coll("prop_" + pid, G["props"])
        root = empty("prop." + pid, c)
        c["root"] = root.name
        use(c, root)
        globals()["p_" + pid]()
    for tid in TILES:
        c = get_coll("tile_" + tid, G["tiles"])
        root = empty("tile." + tid, c)
        c["root"] = root.name
        use(c, root)
        globals()["t_" + tid]()
    layout()


def layout():
    """Spread the assets out in the viewport (renders reset roots to origin)."""
    for c in leaf_colls():
        reset(c.name)
    for k, cid in enumerate(list(CHARS) + ["boss"]):
        bpy.data.objects[cid].location = (k * 2.5 + (1.5 if cid == "boss" else 0), 0, 0)
    for k, pid in enumerate(PROPS):
        bpy.data.objects["prop." + pid].location = ((k % 8) * 3.0, 4 + (k // 8) * 3.0, 0)
    for k, tid in enumerate(TILES):
        bpy.data.objects["tile." + tid].location = (k * 1.5, -4, 0)


# --------------------------------------------------------------- render ----

def sprite_list():
    L = []
    for cid in CHARS:
        anims = HUMAN_ANIMS + (FRIEND_ANIMS if cid in FRIENDS else [("sit", 1)] if cid == "player" else [])
        fs = CHAR_FRAME.get(cid, 64)
        for anim, n in anims:
            for i in range(n):
                L.append(dict(name=f"{cid}.{anim}.{i}", coll="char_" + cid, size=(fs, fs), cam="top",
                              setup=partial(pose_human, cid, anim, i)))
    for anim, n in BOSS_ANIMS:
        for i in range(n):
            L.append(dict(name=f"boss.{anim}.{i}", coll="char_boss", size=(128, 128), cam="top",
                          setup=partial(pose_boss, anim, i)))
    for cid in PORTRAITS:
        L.append(dict(name=f"portrait.{cid}", coll="char_" + cid, size=(96, 96), cam="front",
                      setup=partial(pose_human, cid, "idle", 0)))
    for pid in PROPS:
        L.append(dict(name=f"prop.{pid}", coll="prop_" + pid, size=PROP_SIZES.get(pid), cam="top", setup=None))
    for tid in TILES:
        L.append(dict(name=f"tile.{tid}", coll="tile_" + tid, size=(32, 32), cam="top", setup=None))
    return L


def coll_extent(cname):
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    mx = my = 0.0
    for ob in bpy.data.collections[cname].all_objects:
        if ob.type != "MESH" or ob.hide_render:
            continue
        oe = ob.evaluated_get(dg)
        for v in oe.bound_box:
            w = oe.matrix_world @ Vector(v)
            mx, my = max(mx, abs(w.x)), max(my, abs(w.y))
    return 2 * math.ceil(mx * PX + 1), 2 * math.ceil(my * PX + 1)


def render_one(sp):
    sc = bpy.context.scene
    ours = set(bpy.data.collections["SmokeSim"].all_objects)
    for ob in sc.objects:  # e.g. the factory cube when run as `blender -b -P`
        if ob not in ours:
            ob.hide_render = True
    for c in leaf_colls():
        c.hide_render = c.name != sp["coll"]
    coll = bpy.data.collections[sp["coll"]]
    if sp["setup"]:
        sp["setup"]()
    else:
        reset(sp["coll"])
    root = bpy.data.objects[coll["root"]]
    if not sp["setup"]:
        root.location = (0, 0, 0)
    w, h = sp["size"] or coll_extent(sp["coll"])
    cam = bpy.data.objects["SpriteCam"]
    bpy.data.objects["FaceLight"].hide_render = sp["cam"] != "front"
    if sp["cam"] == "front":
        cam.location = (10, 0, 1.33)
        cam.rotation_euler = (math.radians(90), 0, math.radians(90))
        cam.data.ortho_scale = PORTRAIT_SCALE
    else:
        cam.location = (0, 0, 20)
        cam.rotation_euler = (0, 0, 0)
        cam.data.ortho_scale = max(w, h) / PX
    sc.render.resolution_x, sc.render.resolution_y = w * SS, h * SS
    sc.render.filepath = os.path.join(TMP, sp["name"] + ".png")
    bpy.ops.render.render(write_still=True)
    return w, h


def render(only=None):
    os.makedirs(TMP, exist_ok=True)
    done = []
    for sp in sprite_list():
        if only and not any(sp["name"].startswith(p) for p in only):
            continue
        render_one(sp)
        done.append(sp["name"])
    for c in leaf_colls():
        c.hide_render = False
    layout()
    return done


# ----------------------------------------------------------------- pack ----

def load_png(path):
    img = bpy.data.images.load(path, check_existing=False)
    w, h = img.size
    buf = np.empty(w * h * 4, np.float32)
    img.pixels.foreach_get(buf)
    bpy.data.images.remove(img)
    return buf.reshape(h, w, 4)[::-1].copy()  # top row first


def save_png(arr, path):
    h, w, _ = arr.shape
    img = bpy.data.images.new("__smoke_save", w, h, alpha=True)
    img.pixels.foreach_set(np.ascontiguousarray(arr[::-1], dtype=np.float32).ravel())
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)


def downscale(a):
    """Nearest-neighbour SSx downscale + hard alpha for crisp pixel edges."""
    a = a[SS // 2::SS, SS // 2::SS].copy()
    solid = a[..., 3] >= 0.5
    a[..., 3] = solid.astype(np.float32)
    a[~solid, :3] = 0
    return a


def hexf(h):
    h = h.lstrip("#")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)] + [1.0]


def contact_sheet(sprites, imgs):
    """Grouped preview at 2x; tiles shown 3x3 to prove they repeat seamlessly."""
    S, PAD, W = 2, 6, 1600
    groups_ = []
    for sp in sprites:
        key = sp["name"].split(".")[0]
        if not groups_ or groups_[-1][0] != key:
            groups_.append((key, []))
        groups_[-1][1].append(sp["name"])
    cells = []  # (x, y, array)
    x = y = PAD
    row_h = 0
    for key, names in groups_:
        if key in ("portrait", "prop", "tile") or x > PAD:
            x, y, row_h = PAD, y + row_h + (PAD * 3 if row_h else 0), 0
        for n in names:
            a = imgs[n]
            if key == "tile":
                a = np.tile(a, (3, 3, 1))
            a = a.repeat(S, 0).repeat(S, 1)
            h, w = a.shape[:2]
            if x + w + PAD > W:
                x, y, row_h = PAD, y + row_h + PAD, 0
            cells.append((x, y, a))
            x += w + PAD
            row_h = max(row_h, h)
    H = y + row_h + PAD
    sheet = np.empty((H, W, 4), np.float32)
    sheet[:] = hexf("#0f0f1a")
    for cx, cy, a in cells:
        h, w = a.shape[:2]
        bg = np.empty((h + 4, w + 4, 4), np.float32)
        bg[:] = hexf("#24243c")
        sheet[cy - 2:cy + h + 2, cx - 2:cx + w + 2] = bg
        region = sheet[cy:cy + h, cx:cx + w]
        al = a[..., 3:4]
        region[..., :3] = a[..., :3] * al + region[..., :3] * (1 - al)
    save_png(sheet, SHEET)


def pack():
    sprites = sprite_list()
    imgs = {}
    for sp in sprites:
        path = os.path.join(TMP, sp["name"] + ".png")
        if not os.path.exists(path):
            raise FileNotFoundError(f"missing render {path}; run the render stage")
        imgs[sp["name"]] = downscale(load_png(path))

    # shelf packing, tallest first
    W, PADDING = 1024, 2
    order = sorted(imgs, key=lambda n: (-imgs[n].shape[0], -imgs[n].shape[1], n))
    rects, x, y, shelf = {}, 0, 0, 0
    for n in order:
        h, w = imgs[n].shape[:2]
        if x + w > W:
            x, y, shelf = 0, y + shelf + PADDING, 0
        rects[n] = (x, y, w, h)
        x += w + PADDING
        shelf = max(shelf, h)
    H = y + shelf
    H = (H + 7) // 8 * 8
    atlas = np.zeros((H, W, 4), np.float32)
    for n, (x, y, w, h) in rects.items():
        atlas[y:y + h, x:x + w] = imgs[n]

    os.makedirs(OUT, exist_ok=True)
    save_png(atlas, os.path.join(OUT, "atlas.png"))
    frames = {sp["name"]: dict(zip("xywh", rects[sp["name"]])) for sp in sprites}
    anims = {}
    for sp in sprites:
        parts = sp["name"].split(".")
        if len(parts) == 3:
            anims.setdefault(f"{parts[0]}.{parts[1]}", []).append(sp["name"])
    with open(os.path.join(OUT, "atlas.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump({"frames": frames, "anims": anims}, f, indent=1)
        f.write("\n")
    contact_sheet(sprites, imgs)
    return dict(size=[W, H], frames=len(frames), anims=len(anims))


# ----------------------------------------------------------------- main ----

def main():
    stages = globals().get("SMOKE_STAGES", ("build", "render", "pack", "save"))
    only = globals().get("SMOKE_ONLY")
    report = {}
    if "build" in stages:
        build()
        report["built"] = True
    if "render" in stages:
        report["rendered"] = len(render(only))
    if "pack" in stages:
        report["pack"] = pack()
    if "save" in stages:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND)
        report["saved"] = BLEND
    return report


if __name__ == "__main__":
    RESULT = main()
    print("smoke-sim:", RESULT)
