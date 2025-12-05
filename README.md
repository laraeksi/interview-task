## Task

Go to our [sample API docs](https://sampleapi-explorer.squaredup.com/api-details#api=integrations-v1&operation=service-desk)

This is an API that returns sample service desk data.

The page documents the API definition, the base URL and the optional parameters. There is an example `JSON` response. You can also click the `Try it` button and see different responses based on the supplied query string parameters.

You will use this API to retrieve the data necessary for this task.

*Note*: We are not expecting you to complete **all** of the following tasks. Try to complete as many tasks as you can - ensure the tasks you select match your skill set. Focus on addressing the tasks that create the most significant impact for the end user.

*Submitting the task*: You may use any IDE of your choice to complete the task. Once completed, please zip the entire folder and email it as an attachment to recruitment@squaredup.com with your full name in the subject line.

### Back-end
    - Find the percentage of open vs closed vs pending issues on sample of 500 data points
    - Find the percentage of high vs medium vs low priority issues on sample of 500 data points
    - Find the percentage of on-time vs overdue resolutions
    - Find the average time it took to close the high priority issues of any type on sample of 500 data points
    - What was the “score” value of the “satisfaction_rating” on the issue that took longer to solve in the above set?
    - If time allows, feel free to return any other useful insights from the dataset that you can think of

You can choose how you want to present the above data; simple HTML or JSON is fine.

### Front-end
    - A service desk operator wants to view a list of all issues of any type, sorted by priority (use sample of 100 data points)
    - A service desk operator wants to filter all the open issues of high priority
    - A service desk operator wants to search a list of issues by a word that is contained within the "organization_id"
    - A service desk manager wants a high-level view of key data including number of tickets by priority, type, status and satisfaction_rating

Choose how you want to present the above data

---

## Structure

We are using `Vite` as the front-end build and local development tool. The client is built with `React`, and `Tailwind CSS` is available to simplify styling. All React components are located in the `src/components/` directory. The `index.tsx` file simply mounts the `React` app and does not need to be modified.

We are also using the `vite-plugin-api-routes` plugin to create directory-based API routes. Both `routeBase` and `dirs` are set to: `api`. To add additional routes, simply create a new file in the `api` directory with the desired route name. For example, `src/api/aggregate.ts` will create a `/api/aggregate` route. An exported `GET`, `POST`, or `PUT` function in that file will define the method handler in the respective route.

The `tests` directory is available for adding test cases. It includes subdirectories for `client` and `api` to help organise your tests. To simplify testing, we’ve integrated Mock Service Worker (`mws`). `msw` allows you to create a mock server and simulate API responses. You can find an example in `src/tests/client/App.test.tsx:8`, which demonstrates mocking the `api/data` route.

We are using `TypeScript`. If you're unfamiliar with it, `TypeScript` extends `JavaScript` with syntax for adding static types. It infers types wherever possible, but you can explicitly add types to reduce the likelihood of errors in your code. As an example, we’ve included a `SampleData` interface in `src/api/types`. You should not need to modify or configure the TypeScript compiler options.

Good luck! :thumbsup:

## Getting Started

### Install

Install dependencies.

```bash
npm install -g pnpm@latest-10
```

```bash
pnpm install
```

Serve with hot reload at <http://localhost:5173>.

```bash
pnpm run dev
```

### Lint

```bash
pnpm run lint
```

### Typecheck

```bash
pnpm run typecheck
```

### Build

```bash
pnpm run build
```

### Test

```bash
pnpm run test
```

View and interact with your tests via UI.

```bash
pnpm run test:ui
```
