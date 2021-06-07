export type Front = {
  type: string | null;
  env: string;
  root: string;
  domains: string;
  views: string;
  settings: string;
  routes: string;
  i18n: string;
}

export type Back = {
  type: string | null;
  env: string;
  root: string;
  domains: string;
  controllers: string;
  migrations: string;
  routes: string;
}

export type Settings = {
  name: string;
  short: string;
  lang: string;
  template: string;
  front: Front;
  back: Back;
}
