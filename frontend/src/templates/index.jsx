import BellmontLayout,   { bellmontTemplate }   from './layouts/BellmontLayout';
import BlancClassicLayout, { blancClassicTemplate } from './layouts/BlancClassicLayout';
import NoirClassicLayout,  { noirClassicTemplate }  from './layouts/NoirClassicLayout';
import VirelliLayout,      { virelliTemplate }      from './layouts/VirelliLayout';
import MonteroLayout,      { monteroTemplate }      from './layouts/MonteroLayout';
import ImperialLayout,     { imperialTemplate }     from './layouts/ImperialLayout';
import LuminaLayout,       { luminaTemplate }       from './layouts/LuminaLayout';
import RegentLayout,       { regentTemplate }       from './layouts/RegentLayout';

export const templates = [
  { ...blancClassicTemplate, layoutComponent: BlancClassicLayout },
  { ...noirClassicTemplate,  layoutComponent: NoirClassicLayout  },
  { ...virelliTemplate,      layoutComponent: VirelliLayout      },
  { ...monteroTemplate,      layoutComponent: MonteroLayout      },
  { ...bellmontTemplate,     layoutComponent: BellmontLayout     },
  { ...imperialTemplate,     layoutComponent: ImperialLayout     },
  { ...luminaTemplate,       layoutComponent: LuminaLayout       },
  { ...regentTemplate,       layoutComponent: RegentLayout       },
];