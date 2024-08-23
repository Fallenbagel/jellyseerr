import { getRepository } from '@server/datasource';
import OverrideRule from '@server/entity/OverrideRule';
import type { OverrideRuleResultsResponse } from '@server/interfaces/api/overrideRuleInterfaces';
import { Permission } from '@server/lib/permissions';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';

const overrideRuleRoutes = Router();

overrideRuleRoutes.get(
  '/',
  isAuthenticated(Permission.ADMIN),
  async (req, res, next) => {
    const overrideRuleRepository = getRepository(OverrideRule);

    try {
      const rules = await overrideRuleRepository.find({});

      return res.status(200).json(rules as OverrideRuleResultsResponse);
    } catch (e) {
      next({ status: 404, message: e.message });
    }
  }
);

overrideRuleRoutes.post<
  Record<string, string>,
  OverrideRule,
  {
    genre?: string;
    language?: string;
    profileId?: number;
    rootFolder?: string;
    tags?: number[];
    radarrServiceId?: number;
    sonarrServiceId?: number;
  }
>('/', isAuthenticated(Permission.ADMIN), async (req, res, next) => {
  const overrideRuleRepository = getRepository(OverrideRule);

  try {
    const rule = new OverrideRule({
      genre: req.body.genre,
      language: req.body.language,
      profileId: req.body.profileId,
      rootFolder: req.body.rootFolder,
      tags: req.body.tags,
      radarrServiceId: req.body.radarrServiceId,
      sonarrServiceId: req.body.sonarrServiceId,
    });

    const newIssue = await overrideRuleRepository.save(rule);

    return res.status(200).json(newIssue);
  } catch (e) {
    next({ status: 404, message: e.message });
  }
});

overrideRuleRoutes.put<
  { ruleId: string },
  OverrideRule,
  {
    genre?: string;
    language?: string;
    profileId?: number;
    rootFolder?: string;
    tags?: number[];
    radarrServiceId?: number;
    sonarrServiceId?: number;
  }
>('/:ruleId', isAuthenticated(Permission.ADMIN), async (req, res, next) => {
  const overrideRuleRepository = getRepository(OverrideRule);

  try {
    const rule = await overrideRuleRepository.findOne({
      where: {
        id: Number(req.params.ruleId),
      },
    });

    if (!rule) {
      return next({ status: 404, message: 'Override Rule not found.' });
    }

    rule.genre = req.body.genre;
    rule.language = req.body.language;
    rule.profileId = req.body.profileId;
    rule.rootFolder = req.body.rootFolder;
    rule.tags = req.body.tags;
    rule.radarrServiceId = req.body.radarrServiceId;
    rule.sonarrServiceId = req.body.sonarrServiceId;

    const newIssue = await overrideRuleRepository.save(rule);

    return res.status(200).json(newIssue);
  } catch (e) {
    next({ status: 404, message: e.message });
  }
});

export default overrideRuleRoutes;
