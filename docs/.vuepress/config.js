module.exports = {
  title: "Ryan Acevedo",
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