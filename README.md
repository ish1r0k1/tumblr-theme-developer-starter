# Tumblr Theme Development Starter
This project is a starter kit for fast and easy development of Tumblr theme.

# Features
* Managing workflow with [Gulp](http://gulpjs.com/)
* Live reload usgin [Browsersync](https://www.browsersync.io/)
* Supports `es2015` notation javascript by [Babel](https://babeljs.io/)
* Comfortable styling with [Sass](http://sass-lang.com/)
* Image optimization with [imagemin](https://github.com/imagemin/imagemin)
* Compile the tag of tumblr with json data and display the page displayed on tumblr
* Easy multi-page development possible with [EJS](http://ejs.co/)

# Installation

[Download](https://github.com/ish1r0k1/tumblr-theme-developer-starter/archive/master.zip) or clone repository:

```
git clone git@github.com:ish1r0k1/tumblr-theme-developer-starter.git your-theme-name
```

Goto the starter directory and install the packages:

```
npm install
```

# Start

Lets' start up the server, run:

```
npm start
```

The browser will popup and the build html will be displayed. Every changes to the file will refesh the browser automatically and each file is compiled.

# Data binding

Tumblr tag parser is using [Tumblr Theme Parser](https://github.com/carrot/tumblr-theme-parser).  
For usage see the document there.

# Production

You can create production build by running

```
npm run build
```

It's a build for production. In this build, the tag of tumblr is incorporated into html without begin escaped.

# License

MIT
