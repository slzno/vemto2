# Welcome to Vemto
I'm delighted to announce that Vemto is now a fully open-source project, published under the MIT license.

A few months ago, I (Tiago Rodrigues, creator of Vemto), [wrote a blog post explaining](https://vemto.app/blog/the-future-of-vemto) in detail why Vemto would become open-source.

At the time, I wasn't sure which license to use, but after talking to countless users and customers, I ended up opting for the MIT license.

It took me a while to prepare this repository, for personal reasons, but I finally managed to increase the number of tests to over 400, covering at least the most critical parts of the application, and I will continue adding more tests overtime.

I also managed to finish writing much of the [internal development documentation](/docs/index.md).

I hope you enjoy it, and if you have any questions, please email me at contact@vemto.app.

How to install

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