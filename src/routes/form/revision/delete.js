/**
 * API to delete a revsion
 */
import validate from 'express-validation';
import Joi from 'joi';
import { middleware as tcMiddleware } from 'tc-core-library-js';
import models from '../../../models';

const permissions = tcMiddleware.permissions;

const schema = {
  params: {
    key: Joi.string().max(45).required(),
    version: Joi.number().integer().positive().required(),
    revision: Joi.number().integer().positive().required(),
  },
};


module.exports = [
  validate(schema),
  permissions('form.delete'),
  (req, res, next) => {
    models.sequelize.transaction(() => models.Form.findOne(
      {
        where: {
          key: req.params.key,
          version: req.params.version,
          revision: req.params.revision,
        },
      }).then((form) => {
        if (!form) {
          const apiErr = new Error('Form not found for key' +
            ` ${req.params.key} version ${req.params.version} revision ${req.params.revision}`);
          apiErr.status = 404;
          return Promise.reject(apiErr);
        }
        return form.update({
          deletedBy: req.authUser.userId,
        });
      }).then((form) => {
        form.destroy();
      }).then(() => {
        res.status(204).end();
      })
      .catch(next));
  },
];
