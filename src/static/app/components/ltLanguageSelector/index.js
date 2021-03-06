import template from './ltLanguageSelector.pug';

import 'angular-gettext-loader!../../../po/bn.po';
import 'angular-gettext-loader!../../../po/de.po';
import 'angular-gettext-loader!../../../po/fr.po';

class ltLanguageSelector {
  constructor($window, localStorageService, gettext, gettextCatalog) {
    Object.assign(this, {$window, localStorageService, gettext, gettextCatalog});
    this.languages = {
      bn: this.getDisplayString('bn'),
      de: this.getDisplayString('de'),
      en: 'English',
      fr: this.getDisplayString('fr')
    };
    const language = localStorageService.get('language');
    if (language) {
      gettextCatalog.setCurrentLanguage(language);
    } else if ($window.navigator && $window.navigator.languages) {
      const langs = $window.navigator.languages.filter(lang => this.languages[lang]);
      if (langs.length) {
        gettextCatalog.setCurrentLanguage(langs[0]);
      }
    }
  }

  get language() {
    return this.gettextCatalog.getCurrentLanguage();
  }

  set language(lang) {
    this.localStorageService.set('language', lang);
    this.gettextCatalog.setCurrentLanguage(lang);
  }

  getDisplayString(language) {
    const key = 'LANGUAGE';
    return this.gettextCatalog.getStringFormFor(language, key, 1) || language;
  }
}
ltLanguageSelector.$inject = ['$window', 'localStorageService', 'gettext', 'gettextCatalog'];

export default {
  template,
  controller: ltLanguageSelector
};
