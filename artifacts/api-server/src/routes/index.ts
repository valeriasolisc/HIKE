import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profilesRouter from "./profiles";
import projectsRouter from "./projects";
import sarRouter from "./sar";
import skillsRouter from "./skills";
import validationsRouter from "./validations";
import microprojectsRouter from "./microprojects";
import recruiterRouter from "./recruiter";
import dashboardRouter from "./dashboard";
import applicationsRouter from "./applications";
import messagesRouter from "./messages";
import savedCandidatesRouter from "./saved_candidates";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(profilesRouter);
router.use(projectsRouter);
router.use(sarRouter);
router.use(skillsRouter);
router.use(validationsRouter);
router.use(microprojectsRouter);
router.use(recruiterRouter);
router.use(dashboardRouter);
router.use(applicationsRouter);
router.use(messagesRouter);
router.use(savedCandidatesRouter);

export default router;
