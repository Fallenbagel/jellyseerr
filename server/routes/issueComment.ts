import { getRepository } from '@server/datasource';
import IssueComment from '@server/entity/IssueComment';
import { Permission } from '@server/lib/permissions';
import logger from '@server/logger';
import { isAuthenticated } from '@server/middleware/auth';
import { Router } from 'express';

const issueCommentRoutes = Router();

issueCommentRoutes.get<{ commentId: string }, IssueComment>(
  '/:commentId',
  isAuthenticated(
    [
      Permission.MANAGE_ISSUES,
      Permission.VIEW_ISSUES,
      Permission.CREATE_ISSUES,
    ],
    {
      type: 'or',
    }
  ),
  async (req, res, next) => {
    const issueCommentRepository = getRepository(IssueComment);

    try {
      const comment = await issueCommentRepository.findOneOrFail({
        where: { id: Number(req.params.commentId) },
      });

      if (
        !req.user?.hasPermission(
          [Permission.MANAGE_ISSUES, Permission.VIEW_ISSUES],
          { type: 'or' }
        ) &&
        comment.user.id !== req.user?.id
      ) {
        return next({
          status: 403,
          message: 'You do not have permission to view this comment.',
        });
      }

      return res.status(200).json(comment);
    } catch (e) {
      logger.debug('Request for unknown issue comment failed', {
        label: 'API',
        errorMessage: e.message,
      });
      next({ status: 404, message: 'Issue comment not found.' });
    }
  }
);

issueCommentRoutes.put<
  { commentId: string },
  IssueComment,
  { message: string }
>(
  '/:commentId',
  isAuthenticated([Permission.MANAGE_ISSUES, Permission.CREATE_ISSUES], {
    type: 'or',
  }),
  async (req, res, next) => {
    const issueCommentRepository = getRepository(IssueComment);

    try {
      const comment = await issueCommentRepository.findOneOrFail({
        where: { id: Number(req.params.commentId) },
      });

      if (comment.user.id !== req.user?.id) {
        return next({
          status: 403,
          message: 'You can only edit your own comments.',
        });
      }

      comment.message = req.body.message;

      await issueCommentRepository.save(comment);

      return res.status(200).json(comment);
    } catch (e) {
      logger.debug('Put request for issue comment failed', {
        label: 'API',
        errorMessage: e.message,
      });
      next({ status: 404, message: 'Issue comment not found.' });
    }
  }
);

issueCommentRoutes.delete<{ commentId: string }, IssueComment>(
  '/:commentId',
  isAuthenticated([Permission.MANAGE_ISSUES, Permission.CREATE_ISSUES], {
    type: 'or',
  }),
  async (req, res, next) => {
    const issueCommentRepository = getRepository(IssueComment);

    try {
      const comment = await issueCommentRepository.findOneOrFail({
        where: { id: Number(req.params.commentId) },
      });

      if (
        !req.user?.hasPermission([Permission.MANAGE_ISSUES], { type: 'or' }) &&
        comment.user.id !== req.user?.id
      ) {
        return next({
          status: 403,
          message: 'You do not have permission to delete this comment.',
        });
      }

      await issueCommentRepository.remove(comment);

      return res.status(204).send();
    } catch (e) {
      logger.debug('Delete request for issue comment failed', {
        label: 'API',
        errorMessage: e.message,
      });
      next({ status: 404, message: 'Issue comment not found.' });
    }
  }
);

export default issueCommentRoutes;
