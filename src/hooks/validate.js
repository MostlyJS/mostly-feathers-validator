import { BadRequest } from 'feathers-errors';

import Validation from '../validation';

export default function validate (accepts) {
  return async (hook) => {
    if (typeof accepts === 'function') {
      accepts = accepts(hook);
    }
    const action = hook.params.__action || hook.method;
    if (!accepts[action]) return hook;

    let errors = null;
    switch (hook.method) {
      case 'find':
      case 'get':
      case 'remove':
        if (accepts[action]) {
          errors = await Validation(hook.params, accepts[action]);
        }
        break;
      case 'create':
      case 'update':
      case 'patch':
        if (accepts[action]) {
          errors = await Validation(hook.data, accepts[action]);
        }
        break;
    }
    if (errors && errors.any()) {
      if (hook.data) {
        hook.data.errors = errors.toHuman();
      }
      throw new BadRequest('Validation failed: ' + errors.toHuman());
    }
    return hook;
  };
}