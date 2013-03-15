jit-assassin is a source-to-source transformation for JavaScript that attempts to disable the JIT compiler.

# Installation

jit-assassin is not (yet) available via npm, so installation is manual :

    $ git clone git@github.com:dufour/jit-assassin.git
    $ cd jit-assassin
    $ npm install

# Instrumenting the code

Code can be instrumented using the `jit-assassin` script located in the `bin` directory :

    $ bin/jit-assassin myprog.js > myprog_instrumented.js