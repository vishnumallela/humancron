# humancron

A human readable cron scheduler for Node and Bun with timezone and seconds support.

## Installation

```sh
npm install humancron
# or
bun add humancron
```

## Usage

```ts
import { when } from 'humancron';

// run every day at 9:30am
const stop = when()
  .min(30)
  .hour(9)
  .do(() => {
    console.log('good morning');
  });

// stop the scheduler
stop();
```

## Timezone

```ts
const stop = when()
  .min(0)
  .hour(9)
  .tz('America/New_York')
  .do(() => {
    console.log('9am New York time');
  });
```

Default timezone is `UTC`.

## Seconds

```ts
// run at exactly 9:30:15
const stop = when()
  .sec(15)
  .min(30)
  .hour(9)
  .do(() => {});

// run every 30 seconds
const stop = when()
  .sec({ every: 30 })
  .do(() => {});
```

## Patterns

All fields accept the same pattern types.

```ts
// single value
when().hour(9)

// list
when().min([0, 15, 30, 45])

// range
when().hour({ from: 9, to: 17 })

// step
when().min({ every: 5 })

// range with step
when().min({ from: 0, to: 30, every: 10 })
```

## Named values

```ts
// months
when().month('jan')
when().month('feb')
// ... mar apr may jun jul aug sep oct nov dec

// weekdays
when().week('mon')
when().week('fri')
// ... sun tue wed thu sat
```

## Fields

| Method   | Range  | Description     |
|----------|--------|-----------------|
| .sec()   | 0-59   | second          |
| .min()   | 0-59   | minute          |
| .hour()  | 0-23   | hour            |
| .date()  | 1-31   | day of month    |
| .month() | 1-12   | month           |
| .week()  | 0-6    | day of week     |
| .tz()    | string | IANA timezone   |

Unset fields default to `*` (every).

## Inspect the pattern

```ts
const pattern = when()
  .min(30)
  .hour(9)
  .tz('Asia/Kolkata');

console.log(pattern.cron);
// * 30 9 * * * [Asia/Kolkata]
```

## License

MIT