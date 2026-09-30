import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import LayoutWrapper from "@/src/components/LayoutWrapper";
import { paths } from "@/src/routes/mainRoutes";

const Home = lazy(() => import("@/src/pages/home/page"));
const Work = lazy(() => import("@/src/pages/work/page"));
const FormBuilder = lazy(() => import("@/src/pages/work/form-builder/page"));
const AiAgents = lazy(() => import("@/src/pages/work/ai-agents/page"));
const Resume = lazy(() => import("@/src/pages/resume/page"));
const Playground = lazy(() => import("@/src/pages/playground/page"));
const Demos = lazy(() => import("@/src/pages/demos/page"));
const Chat = lazy(() => import("@/src/pages/chat/page"));
const ChatGroup = lazy(() => import("@/src/pages/chat/group/page"));
const NotFound = lazy(() => import("@/src/pages/NotFound"));

function OldProjectRedirect() {
  const { slug } = useParams();
  return <Navigate to={`${paths.work}/${slug}`} replace />;
}

export default function App() {
  return (
    <LayoutWrapper>
      <Suspense fallback={null}>
        <Routes>
          <Route path={paths.home} element={<Home />} />
          <Route path={paths.work} element={<Work />} />
          <Route path={paths.formBuilder} element={<FormBuilder />} />
          <Route path={paths.aiAgents} element={<AiAgents />} />
          <Route path={paths.resume} element={<Resume />} />
          <Route path={paths.playground} element={<Playground />} />
          <Route path={paths.demos} element={<Demos />} />
          <Route path={paths.chat} element={<Chat />} />
          <Route path={paths.chatGroup} element={<ChatGroup />} />
          <Route path={paths.projects} element={<Navigate to={paths.work} replace />} />
          <Route path={`${paths.projects}/:slug`} element={<OldProjectRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LayoutWrapper>
  );
}
