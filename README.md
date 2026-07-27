# Skyassist

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.5.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deployment

SkyAssist is deployed through Vercel with automatic deployments from the GitHub `main` branch.

### Deployment workflow

1. Push code changes to `main` in GitHub.
2. Vercel detects the new commit and starts a production build automatically.
3. If the build succeeds, Vercel publishes the new version to the live URL.

### Recommended pre-deploy checks

Run these checks locally before pushing:

- `npm install`
- `npm run build`

### Verify deployment

After pushing to `main`:

1. Open the Vercel project dashboard.
2. Confirm the latest deployment status is `Ready`.
3. Open the live site and test login, chat, source preview, and feedback flows.

### Notes

- No manual deployment command is required for production updates.
- If deployment fails, review the Vercel build logs and fix errors in the branch before re-pushing.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
