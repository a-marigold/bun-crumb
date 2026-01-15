const selectionSort = (array: number[]) => {
    const arrayLength = array.length;

    for (let i = 0; i < arrayLength; i++) {
        let minIndex = i;

        for (let j = i + 1; j < arrayLength; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }

        const temporaryMin = array[i];

        array[i] = array[minIndex];
        array[minIndex] = temporaryMin;
    }

    return array;
};
// console.log(selectionSort([0, 10, 2, 3, 6, 17, 16]));

const bubbleSort = (array: number[]) => {
    const arrayLength = array.length;

    for (let i = 0; i < arrayLength; i++) {
        for (let j = 0; j < arrayLength - i; j++) {
            if (array[j] > array[j + 1]) {
                const temporaryMin = array[j];

                array[j] = array[j + 1];
                array[j + 1] = temporaryMin;
            }

            console.log(array);
        }
    }

    return array;
};

console.log(bubbleSort.apply(null, [[-3, 2, -1, 10, 6, 17, 19, 20]]));

const promiseAllSettled = <T>(promises: Promise<T>[]): Promise<T[]> => {
    const promisesLength = promises.length;

    let completedPromises = 0;

    const handler = (value: T) => {
        // result[] = value;
        // ++index;
    };

    const result: T[] = [];
    return new Promise((resolve) => {
        let index = 0;

        while (index < promisesLength) {
            promises[index].then(handler, handler);
            ++index;
            if (index === promisesLength) {
                resolve(result);
                break;
            }
        }
    });
};

const orderedPromseAll = <T>(
    promiseFns: (() => Promise<T>)[]
): Promise<T[]> => {
    const result: T[] = [];

    const fnsLength = promiseFns.length;

    let promiseAccumulator: Promise<T | void> = Promise.resolve();

    let index = 0;

    while (index < fnsLength) {
        const currentIndex = index;
        promiseAccumulator = promiseAccumulator.then(() =>
            promiseFns[currentIndex]().then(
                (value) => (result[currentIndex] = value)
            )
        );
        ++index;
    }

    return promiseAccumulator.then(() => result);
};
