// @flow
import { getRoot, getUserLanguages, notFound } from '../controllers';

import { Router } from 'express';

const router = Router();
router.get('/favicon.ico',notFound);
router.get('/:username', getUserLanguages);
router.get('*', getRoot);

export default router;
