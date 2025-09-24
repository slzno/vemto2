# Welcome to Vemto
[![Vemto showcase](https://img.youtube.com/vi/9Ajie_-zcNI/0.jpg)](https://www.youtube.com/watch?v=9Ajie_-zcNI)

[*Vemto showcase video on Youtube*](https://www.youtube.com/watch?v=9Ajie_-zcNI)

I'm delighted to announce that Vemto is now a fully open-source project, published under the MIT license.

A few months ago, I (Tiago Rodrigues, creator of Vemto), [wrote a blog post explaining](https://vemto.app/blog/the-future-of-vemto) in detail why Vemto would become open-source.

At the time, I wasn't sure which license to use, but after talking to countless users and customers, I ended up opting for the MIT license.

It took me a while to prepare this repository, for personal reasons, but I finally managed to increase the number of tests to over 400, covering at least the most critical parts of the application, and I will continue adding more tests overtime.

I also managed to finish writing much of the [internal development documentation](/docs/index.md).

I hope you enjoy it, and if you have any questions, please email me at contact@vemto.app.

By [Tiago Rodrigues](https://x.com/Tiago_Ferat)

# Contact

- contact@vemto.app
- [Discord Server](https://discord.gg/CWnbWtJ)
- https://x.com/VemtoApp
- https://vemto.app

# How to install

I recommend using yarn to compile Vemto. So, the first step is to install all the dependencies:

```
yarn install
```

After that, install PHP Box (used to compile the PHP components):

```
composer global require humbug/box
```

Make sure to add Composer's /bin directory to your PATH so you can run Box globally (this is necessary to compile Vemto).

After that, access each of the PHP tools in src/php/apps and run the command:

```
composer install
```

inside their directories.

NOTE: It would be nice to automate this third step when running the development environment or when compiling the application in the future.

Finally, run Vemto in development mode with:

```
yarn dev:fast
```

## Developer Documentation

[Click here](/docs/index.md) to view documentation on architecture, code style, and more.

## How to contribute?

Currently, you can contribute in several ways.

- Writing tests for classes that don't yet have them.
- Fixing bugs you find.
- Resolving open issues.
- Improving our [docs](https://github.com/VemtoOrg/vemto-docs)
- Adding support for improvements like Filament 4, the new Laravel 12+ FrontEnd templates, etc.
- If you have ideas for new features, please open a discussion here so we can discuss them.

The idea is that Vemto's next steps will focus on things like:

- Writing documentation on how to use Vemto. Currently, we only have v1 documentation on the website.
- Fixing most of the bugs, making it work with the vast majority of Laravel projects.
- Implementing plugin support, as was the case in v1.
- Adding support for more AI features, like generating a schema from a text description, etc.
- Focusing on what Vemto is best at: the Schema Editor.

# License

Vemto's source code is licensed under the MIT license. 

# Do I still need a license key?

Some features are only accessible to license keys holders, such as:

- Ready-made builds
- Auto-updates
- Features that use Vemto's servers to function (such as AI, etc.)

> **However, license keys sales are currently paused, and only current license holders can access them.**

If you have any questions, please contact me on **contact@vemto.app**.

# What does Vemto mean?

The word Vemto comes from my native language (Portuguese), from the original Vento, which means wind. I named the software this way because of its main objective, which has always been speed in the development of Laravel applications.