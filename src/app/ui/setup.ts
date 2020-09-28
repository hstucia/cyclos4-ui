import { Configuration } from 'app/ui/configuration';

/**
 * Set all desired Cyclos configuration options
 */
export function setup() {
  Configuration.apiRoot = 'api';
  Configuration.appTitle = 'La Cigogne MLC Numérique';
  Configuration.appTitleSmall = 'La Cigogne';
  Configuration.appTitleMenu = 'La Cigogne menu';
  //Configuration.logoUrl = 'images/logo.png';
  Configuration.logoUrl = 'https://lacigogne-alsace.fr/wp-content/uploads/2020/04/LOGO-Cigogne-copie-e1588085835525.png';
}
