<script setup lang="ts">
    import { defineProps, ref, onMounted } from "vue"
    import {
        CubeTransparentIcon, TruckIcon,
    } from "@heroicons/vue/24/outline"
import UiLoading from "./UiLoading.vue"
    
    const props = defineProps({
        development: {
            type: Boolean,
            default: false,
        },

        local: {
            type: Boolean,
            default: false,
        },

        loading: {
            type: Boolean,
            default: false,
        },
    })

    const randomQuote = ref("")

    onMounted(() => {
        fillRandomQuote()
    })

    const fillRandomQuote = () => {
        randomQuote.value = ""

        setTimeout(() => {
            randomQuote.value = getRandomQuote()
        }, 10)

        // after some time sufficiant to read the quote, change it (consider the length of the quote)
        let nextQuoteTime = (randomQuote.value.length * 30) + 20000

        setTimeout(() => {
            fillRandomQuote()
        }, nextQuoteTime)
    }

    const getRandomQuote = () => {
        return quotes[Math.floor(Math.random() * quotes.length)]
    }

    const quotes = [
        "Programming today is a race between software engineers striving to build bigger and better idiot-proof programs, and the universe trying to build bigger and better idiots. So far, the universe is winning. - Rick Cook",
        "Lisp isn't a language, it's a building material. - Alan Kay",
        "Walking on water and developing software from a specification are easy if both are frozen. - Edward V Berard",
        "A programming language is low level when its programs require attention to the irrelevant. - Alan J. Perlis.",
        "A C program is like a fast dance on a newly waxed dance floor by people carrying razors. - Waldi Ravens.",
        "I have always wished for my computer to be as easy to use as my telephone; my wish has come true because I can no longer figure out how to use my telephone. - Bjarne Stroustrup",
        "Most good programmers do programming not because they expect to get paid or get adulation by the public, but because it is fun to program. - Linus Torvalds",
        "Most software today is very much like an Egyptian pyramid with millions of bricks piled on top of each other, with no structural integrity, but just done by brute force and thousands of slaves. - Alan Kay",
        "Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it. - Brian W. Kernighan.",
        "The trouble with programmers is that you can never tell what a programmer is doing until it’s too late. - Seymour Cray",
        "The computer was born to solve problems that did not exist before. - Bill Gates",
        "I do not fear computers. I fear lack of them. - Isaac Asimov",
        "A computer once beat me at chess, but it was no match for me at kick boxing. - Emo Philips",
        "Computer Science is no more about computers than astronomy is about telescopes. - Edsger W. Dijkstra",
        "The best thing about a boolean is even if you are wrong, you are only off by a bit. - Anonymous",
        "The most important property of a program is whether it accomplishes the intention of its user. - C.A.R. Hoare",
        "Software is like entropy: It is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics; i.e., it always increases. - Norman Augustine",
        "Software is a gas; it expands to fill its container. - Nathan Myhrvold",
        "All parts should go together without forcing.  You must remember that the parts you are reassembling were disassembled by you.  Therefore, if you can’t get them together again, there must be a reason.  By all means, do not use a hammer. - IBM Manual, 1925",
        "Standards are always out of date.  That’s what makes them standards. - Alan Bennett",
        "Physics is the universe’s operating system. - Steven R Garman",
        "It’s hardware that makes a machine fast.  It’s software that makes a fast machine slow. - Craig Bruce",
        "If you think your users are idiots, only idiots will use it. - Linus Torvalds",
        "From a programmer’s point of view, the user is a peripheral that types when you issue a read request. - P. Williams",
        "Computers are good at following instructions, but not at reading your mind. - Donald Knuth",
        "Your most unhappy customers are your greatest source of learning. - Bill Gates",
        "Let us change our traditional attitude to the construction of programs: Instead of imagining that our main task is to instruct a computer what to do, let us concentrate rather on explaining to human beings what we want a computer to do. - Donald E. Knuth",
        "The Internet?  We are not interested in it. - Bill Gates, 1993",
        "The best way to get accurate information on Usenet is to post something wrong and wait for corrections. - Matthew Austern",
        "Low-level programming is good for the programmer’s soul. - John Carmack",
        "Programs must be written for people to read, and only incidentally for machines to execute. - Harold Abelson",
        "We have to stop optimizing for programmers and start optimizing for users. - Jeff Atwood",
        "It’s OK to figure out murder mysteries, but you shouldn’t need to figure out code.  You should be able to read it. - Steve McConnell",
        "If we wish to count lines of code, we should not regard them as ‘lines produced’ but as ‘lines spent.' - Edsger Dijkstra",
        "Before software should be reusable, it should be usable. - Ralph Johnson",
        "If you automate a mess, you get an automated mess. - Rod Michael",
        "Looking at code you wrote more than two weeks ago is like looking at code you are seeing for the first time. - Dan Hurvitz",
        "It is easier to change the specification to fit the program than vice versa. - Alan Perlis",
        "Simplicity, carried to the extreme, becomes elegance. - Jon Franklin",
        "A program is never less than 90% complete, and never more than 95% complete. - Terry Baker",
        "Everyone by now presumably knows about the danger of premature optimization.  I think we should be just as worried about premature design — designing too early what a program should do. - Paul Graham",
        "The best way to predict the future is to implement it. - David Heinemeier Hansson",
        "The most important single aspect of software development is to be clear about what you are trying to build. - Bjarne Stroustrup",
        "The best performance improvement is the transition from the nonworking state to the working state. - John Ousterhout",
        "Make everything as simple as possible, but not simpler. - Albert Einstein",
        "Today, most software exists, not to solve a problem, but to interface with other software. - IO Angell",
        "Good specifications will always improve programmer productivity far better than any programming tool or technique. - Milt Bryce",
        "Don’t document the problem, fix it. - Atli Björgvin Oddsson",
        "As a rule, software systems do not work well until they have been used, and have failed repeatedly, in real applications. - Dave Parnas",
        "If the code and the comments do not match, possibly both are incorrect. - Norm Schryer",
        "I think it’s a new feature.  Don’t tell anyone it was an accident. - Larry Wall",
        "If you don’t handle [exceptions], we shut your application down.  That dramatically increases the reliability of the system. - Anders Hejlsberg",
        "When debugging, novices insert corrective code; experts remove defective code. - Richard Pattis",
        "The best way to get a project done faster is to start sooner. - Jim Highsmith",
        "I think it is inevitable that people program poorly.  Training will not substantially help matters.  We have to learn to live with it. - Alan Perlis",
        "It was a joke, okay?  If we thought it would actually be used, we wouldn’t have written it! - Mark Andreesen, about the HTML tag BLINK",
        "Two years from now, spam will be solved. - Bill Gates, 2004",
        "The problem of viruses is temporary and will be solved in two years. - John McAfee, 1988",
        "Computer viruses are an urban legend. - Peter Norton, 1988",
        "I don’t know what the language of the year 2000 will look like, but I know it will be called Fortran. - C.A.R. Hoare, 1982",
        "In the future, computers may weigh no more than 1.5 tonnes. - Popular Mechanics, 1949",
        "I see little commercial potential for the Internet for at least ten years. - Bill Gates, 1994",
        "Before man reaches the moon, mail will be delivered within hours from New York to California, to Britain, to India or Australia. - Arthur Summerfield, 1959",
    ]
</script>

<template>
    <div
        :style="local ? '' : 'width: calc(100vw - 80px)'"
        class="text-sm p-2 flex items-center justify-center space-x-2 pointer-events-none"
        :class="{
            'fixed top-0 right-0 h-screen': !local
        }"
    >
        <div class="flex flex-col items-center space-y-10">
            <div>
                <div v-if="loading">
                    <UiLoading :size="100" />
                </div>

                <div v-else>
                    <TruckIcon
                        v-if="development"
                        class="w-36 h-36 text-slate-200 dark:text-slate-800 stroke-1"
                    />
                    <CubeTransparentIcon
                        v-else
                        class="w-36 h-36 text-slate-200 dark:text-slate-800 stroke-1"
                    />
                </div>
            </div>

            <div
                class="flex flex-col items-center text-slate-400 text-4xl font-thin"
            >
                <slot></slot>

                <!-- Show a random quote -->
                <span
                    class="text-base max-w-xl text-center text-slate-600 dark:text-slate-500 font-mono mt-5 border-dotted font-normal h-7 overflow-visible"
                >
                    <Transition
                        enter-from-class="transition duration-2000 opacity-0"
                        enter-to-class="transition duration-2000 opacity-100"
                        leave-from-class="transition duration-2000 opacity-100"
                        leave-to-class="transition duration-2000 opacity-0"
                    >
                    <div v-if="randomQuote">
                        {{ randomQuote }}
                    </div>
                    </Transition>
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
