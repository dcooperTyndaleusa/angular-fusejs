import {Injectable} from '@angular/core'
import * as Fuse from 'fuse.js'
import FuseOptions = Fuse.FuseOptions;

// Should not include lodash, but only lodash.set / lodash.get
import * as _ from 'lodash'

export interface AngularFusejsOptions extends FuseOptions {
  supportHighlight?: boolean;
  fusejsHighlightKey?: string;
  minSearchTermLength?: number;
}
@Injectable()
export class FusejsService {
  private defaultOptions: AngularFusejsOptions = {
    supportHighlight: true,
    shouldSort: false,
    threshold: 0.4,
    minMatchCharLength: 3,
    include: [],
    minSearchTermLength: 3,
    fusejsHighlightKey: 'fuseJsHighlighted'
  };

  constructor() {
  }

  searchList(list: Array<any>, searchTerms: string, options: AngularFusejsOptions = {}) {
    const fuseOptions: AngularFusejsOptions = Object.assign({}, this.defaultOptions, options);

    if (fuseOptions.supportHighlight) {
      fuseOptions.include.push('matches');
    }

    let fuse = new Fuse(list, fuseOptions);
    let result = fuse.search(searchTerms);

    if (fuseOptions.supportHighlight) {
      result = this.handleHighlight(result, fuseOptions);
    }

    return result;
  }

  setDefaultOptions(options: AngularFusejsOptions) {
    Object.assign(this.defaultOptions, options);
  }

  private handleHighlight(result, options: AngularFusejsOptions) {
    return result.map((matchObject) => {
      const item = matchObject.item;
      item[options.fusejsHighlightKey] = JSON.parse(JSON.stringify(item));

      for (let match of matchObject.matches) {
        const key = match.key;
        const indices = match.indices;

        if(indices[0]) {
          //TODO make it work with array indices (does not work out of the box with fusejs)
          _.set(item[options.fusejsHighlightKey], key, (_.get(item, key) as string).substring(indices[0][0], indices[0][1] + 1))
        }
      }

      return item;
    });
  }
}