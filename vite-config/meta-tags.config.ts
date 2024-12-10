import { HtmlMetaTagPluginConfig } from '../vite-plugins';

export const MetaTagsConfig: HtmlMetaTagPluginConfig = [
  {
    charset: 'UTF-8',
  },
  {
    name: 'author',
    content: 'EducAItion',
  },
  {
    name: 'application-name',
    content: 'EducAItion',
  },
  {
    name: 'keywords',
    content: 'AI, Education, Learning, Machine Learning, Artificial Intelligence',
  },
  {
    name: 'description',
    content: 'EducAItion is a suite of products that will help you learn with AI.',
  },
  {
    name: 'robots',
    content: 'noindex, nofollow',
  },
  {
    name: 'viewport',
    content: 'width=device-width, initial-scale=1.0',
  },
];
