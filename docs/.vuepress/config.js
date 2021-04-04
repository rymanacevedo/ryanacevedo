module.exports = {
  title: 'Ryan Acevedo',
  description: 'An awesome portoflio blog',
  themeConfig: {
    nav: [
      {text: 'Home', link: '/'},
      {text: 'About', link: '/about/'},
      {text: 'Blog', link: '/blog/'},
      {text: 'Contact', link: '/contact/'},
    ]
  },
  plugins: [
    [
      'vuepress-plugin-typescript',
      {
        tsLoaderOptions: {
        },
      },
      'tachyons'
    ],
  ],
}