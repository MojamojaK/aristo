export interface Environment {
  name: string;
  header: string;
}

export interface SubCategory {
  name: string;
  header: string;
  environments: Environment[];
}

export interface Genus {
  name: string;
  header: string;
  sub_categories: SubCategory[];
}

export interface AutoImage {
  id: string;
  line_breaks?: number[];
}

export interface ContentItem {
  text?: string;
  auto_image?: AutoImage;
  local_images?: string[];
}

export interface EntryContent {
  items: ContentItem[];
}

export interface LogEntry {
  date: string;
  contents: EntryContent[];
}

export interface CultivationLogData {
  source: string;
  propagation: string | null;
  start_date: string;
  entries: LogEntry[];
}

export interface NativeHabitatLocation {
  name: string;
  maps: string[];
}

export interface NativeHabitat {
  locations: NativeHabitatLocation[];
  elevation: string;
  temperature: string;
}

export interface CultivationNote {
  text: string;
  children?: CultivationNote[];
}

export interface CultivationEnvironment {
  temperatureTheory?: string;
  temperature?: CultivationNote;
  humidity?: CultivationNote;
  soil?: CultivationNote;
  light?: CultivationNote;
}

export interface CultivationLog {
  slug: string;
  name: string;
  alias: string | null;
  genus: string;
  sub_category: string;
  environment: string;
  logs: CultivationLogData[];
  nativeHabitat: NativeHabitat | null;
  cultivationEnvironment: CultivationEnvironment | null;
  bodyContent: string;
}

export interface DomesticStore {
  name: string;
  location: string;
  types: string[];
  link: string;
  memo: string;
}

export interface InternationalStore {
  name: string;
  location: string;
  link: string;
  notes: string;
  import_logs: string;
}

export interface GreenhousePage {
  slug: string;
  url: string;
  title: string;
  content: string;
}
