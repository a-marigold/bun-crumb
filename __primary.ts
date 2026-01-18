const ITERATIONS = 100000;

const generateValueFromRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

const uuid = () => {
    const u1 = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        crypto.randomUUID();
    }

    const u2 = performance.now();

    const r1 = performance.now();

    for (let i = 0; i < ITERATIONS; i++) {
        generateValueFromRange(1_000_000, 10_000_000);
    }

    const r2 = performance.now();

    Bun.stdout.write('uuid ' + (u2 - u1) + 'ms\n');

    Bun.stdout.write('random ' + (r2 - r1) + 'ms\n');
};
console.log('    uuid    ');
uuid();

const awaitVsPromises = () => {
    const awaitFn = async () => {
        return await new Promise((resolve) => {
            resolve(undefined);
        });
    };

    const promiseFn = () => {
        return new Promise((resolve) => {
            resolve(undefined);
        }).then((value) => value);
    };

    const a1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        awaitFn();
    }
    const a2 = performance.now();

    const p1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        promiseFn();
    }
    const p2 = performance.now();

    Bun.stdout.write(a2 - a1 + '\n' + (p2 - p1) + '\n');
};

console.log('    await vs promises    ');
awaitVsPromises();

const wish = -16;
let number = wish;
const m1 = performance.now();
for (let i = 0; i < 1_000_000; i++) {
    number = Math.abs(wish);
}
const m2 = performance.now();
const h1 = performance.now();
for (let i = 0; i < 1_000_000; i++) {
    number = wish - wish - wish;
}
const h2 = performance.now();
const u1 = performance.now();
for (let i = 0; i < 1_000_000; i++) {
    number = wish * -1;
}
const u2 = performance.now();
console.log(number);
console.log(m2 - m1);
console.log(h2 - h1);
console.log(u2 - u1);
