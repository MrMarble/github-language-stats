// @flow
import { getRoot, getUserLanguages } from '../controllers';

import { Router } from 'express';

const router = Router();

router.get('/:username', getUserLanguages);
router.get('*', getRoot);

export default router;
