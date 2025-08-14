2025-08-14T20:39:53.7634317Z Current runner version: '2.327.1'
2025-08-14T20:39:53.7658319Z ##[group]Runner Image Provisioner
2025-08-14T20:39:53.7659141Z Hosted Compute Agent
2025-08-14T20:39:53.7659814Z Version: 20250812.370
2025-08-14T20:39:53.7660692Z Commit: 4a2b2bf7520004e3e907c2150c8cabe342a3da32
2025-08-14T20:39:53.7661497Z Build Date: 2025-08-12T16:08:14Z
2025-08-14T20:39:53.7662087Z ##[endgroup]
2025-08-14T20:39:53.7662646Z ##[group]Operating System
2025-08-14T20:39:53.7663238Z Ubuntu
2025-08-14T20:39:53.7663697Z 24.04.2
2025-08-14T20:39:53.7664155Z LTS
2025-08-14T20:39:53.7665019Z ##[endgroup]
2025-08-14T20:39:53.7665533Z ##[group]Runner Image
2025-08-14T20:39:53.7666064Z Image: ubuntu-24.04
2025-08-14T20:39:53.7666618Z Version: 20250804.2.0
2025-08-14T20:39:53.7667639Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250804.2/images/ubuntu/Ubuntu2404-Readme.md
2025-08-14T20:39:53.7669275Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250804.2
2025-08-14T20:39:53.7670457Z ##[endgroup]
2025-08-14T20:39:53.7671637Z ##[group]GITHUB_TOKEN Permissions
2025-08-14T20:39:53.7673721Z Contents: read
2025-08-14T20:39:53.7674281Z Metadata: read
2025-08-14T20:39:53.7674919Z Packages: read
2025-08-14T20:39:53.7675403Z ##[endgroup]
2025-08-14T20:39:53.7677522Z Secret source: Actions
2025-08-14T20:39:53.7678372Z Prepare workflow directory
2025-08-14T20:39:53.8207984Z Prepare all required actions
2025-08-14T20:39:53.8264855Z Getting action download info
2025-08-14T20:39:54.1429296Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
2025-08-14T20:39:54.5173431Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
2025-08-14T20:39:54.6810361Z Complete job name: build-and-deploy
2025-08-14T20:39:54.7515458Z ##[group]Run actions/checkout@v4
2025-08-14T20:39:54.7516409Z with:
2025-08-14T20:39:54.7516794Z   fetch-depth: 0
2025-08-14T20:39:54.7517249Z   repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:54.7517992Z   token: ***
2025-08-14T20:39:54.7518382Z   ssh-strict: true
2025-08-14T20:39:54.7518783Z   ssh-user: git
2025-08-14T20:39:54.7519182Z   persist-credentials: true
2025-08-14T20:39:54.7519636Z   clean: true
2025-08-14T20:39:54.7520211Z   sparse-checkout-cone-mode: true
2025-08-14T20:39:54.7520697Z   fetch-tags: false
2025-08-14T20:39:54.7521113Z   show-progress: true
2025-08-14T20:39:54.7521537Z   lfs: false
2025-08-14T20:39:54.7521914Z   submodules: false
2025-08-14T20:39:54.7522327Z   set-safe-directory: true
2025-08-14T20:39:54.7523020Z env:
2025-08-14T20:39:54.7523403Z   NODE_VERSION: 20
2025-08-14T20:39:54.7523833Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:39:54.7524304Z ##[endgroup]
2025-08-14T20:39:54.8623487Z Syncing repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:54.8625477Z ##[group]Getting Git version info
2025-08-14T20:39:54.8626336Z Working directory is '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT'
2025-08-14T20:39:54.8627651Z [command]/usr/bin/git version
2025-08-14T20:39:54.8656418Z git version 2.50.1
2025-08-14T20:39:54.8683216Z ##[endgroup]
2025-08-14T20:39:54.8703472Z Temporarily overriding HOME='/home/runner/work/_temp/bdbd68e1-2d94-40bd-b63a-f9ce6566269b' before making global git config changes
2025-08-14T20:39:54.8704867Z Adding repository directory to the temporary git global config as a safe directory
2025-08-14T20:39:54.8708597Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:54.8742853Z Deleting the contents of '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT'
2025-08-14T20:39:54.8746259Z ##[group]Initializing the repository
2025-08-14T20:39:54.8750288Z [command]/usr/bin/git init /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:54.8815039Z hint: Using 'master' as the name for the initial branch. This default branch name
2025-08-14T20:39:54.8817064Z hint: is subject to change. To configure the initial branch name to use in all
2025-08-14T20:39:54.8818842Z hint: of your new repositories, which will suppress this warning, call:
2025-08-14T20:39:54.8819559Z hint:
2025-08-14T20:39:54.8820236Z hint: 	git config --global init.defaultBranch <name>
2025-08-14T20:39:54.8820856Z hint:
2025-08-14T20:39:54.8821432Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2025-08-14T20:39:54.8822366Z hint: 'development'. The just-created branch can be renamed via this command:
2025-08-14T20:39:54.8823337Z hint:
2025-08-14T20:39:54.8823769Z hint: 	git branch -m <name>
2025-08-14T20:39:54.8824266Z hint:
2025-08-14T20:39:54.8824883Z hint: Disable this message with "git config set advice.defaultBranchName false"
2025-08-14T20:39:54.8826054Z Initialized empty Git repository in /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/.git/
2025-08-14T20:39:54.8828765Z [command]/usr/bin/git remote add origin https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:54.8860698Z ##[endgroup]
2025-08-14T20:39:54.8862010Z ##[group]Disabling automatic garbage collection
2025-08-14T20:39:54.8865683Z [command]/usr/bin/git config --local gc.auto 0
2025-08-14T20:39:54.8894229Z ##[endgroup]
2025-08-14T20:39:54.8895571Z ##[group]Setting up auth
2025-08-14T20:39:54.8901828Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-08-14T20:39:54.8932894Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-08-14T20:39:54.9216171Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-08-14T20:39:54.9247302Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-08-14T20:39:54.9476356Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2025-08-14T20:39:54.9511709Z ##[endgroup]
2025-08-14T20:39:54.9512595Z ##[group]Fetching the repository
2025-08-14T20:39:54.9520796Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*
2025-08-14T20:39:55.7786189Z From https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:55.7787826Z  * [new branch]      codex/update-pwastatus-test-for-badge -> origin/codex/update-pwastatus-test-for-badge
2025-08-14T20:39:55.7789039Z  * [new branch]      main       -> origin/main
2025-08-14T20:39:55.7825930Z [command]/usr/bin/git branch --list --remote origin/main
2025-08-14T20:39:55.7849462Z   origin/main
2025-08-14T20:39:55.7861379Z [command]/usr/bin/git rev-parse refs/remotes/origin/main
2025-08-14T20:39:55.7882553Z ca0ff9ccfb73a4a03ce8641ea69caca472f554bf
2025-08-14T20:39:55.7892818Z ##[endgroup]
2025-08-14T20:39:55.7894007Z ##[group]Determining the checkout info
2025-08-14T20:39:55.7895329Z ##[endgroup]
2025-08-14T20:39:55.7896783Z [command]/usr/bin/git sparse-checkout disable
2025-08-14T20:39:55.7937317Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2025-08-14T20:39:55.7964828Z ##[group]Checking out the ref
2025-08-14T20:39:55.7969033Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2025-08-14T20:39:55.8660163Z Switched to a new branch 'main'
2025-08-14T20:39:55.8661913Z branch 'main' set up to track 'origin/main'.
2025-08-14T20:39:55.8673777Z ##[endgroup]
2025-08-14T20:39:55.8711808Z [command]/usr/bin/git log -1 --format=%H
2025-08-14T20:39:55.8734147Z ca0ff9ccfb73a4a03ce8641ea69caca472f554bf
2025-08-14T20:39:55.9018735Z ##[group]Run actions/setup-node@v4
2025-08-14T20:39:55.9020027Z with:
2025-08-14T20:39:55.9020903Z   node-version: 20
2025-08-14T20:39:55.9021785Z   cache: npm
2025-08-14T20:39:55.9022849Z   cache-dependency-path: jarvis-chat/package-lock.json
2025-08-14T20:39:55.9024168Z   always-auth: false
2025-08-14T20:39:55.9025330Z   check-latest: false
2025-08-14T20:39:55.9026544Z   token: ***
2025-08-14T20:39:55.9027386Z env:
2025-08-14T20:39:55.9028196Z   NODE_VERSION: 20
2025-08-14T20:39:55.9029152Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:39:55.9030442Z ##[endgroup]
2025-08-14T20:39:56.0852800Z Found in cache @ /opt/hostedtoolcache/node/20.19.4/x64
2025-08-14T20:39:56.0859444Z ##[group]Environment details
2025-08-14T20:39:57.7226270Z node: v20.19.4
2025-08-14T20:39:57.7226695Z npm: 10.8.2
2025-08-14T20:39:57.7226977Z yarn: 1.22.22
2025-08-14T20:39:57.7229293Z ##[endgroup]
2025-08-14T20:39:57.7249348Z [command]/opt/hostedtoolcache/node/20.19.4/x64/bin/npm config get cache
2025-08-14T20:39:58.0383186Z /home/runner/.npm
2025-08-14T20:39:58.1721904Z Cache hit for: node-cache-Linux-x64-npm-9a18259fac7913a495886720380a5439d83a5add66f3f6dd036d2fed991eeaa3
2025-08-14T20:39:59.1719405Z Received 84798540 of 84798540 (100.0%), 93.2 MBs/sec
2025-08-14T20:39:59.1725652Z Cache Size: ~81 MB (84798540 B)
2025-08-14T20:39:59.1769844Z [command]/usr/bin/tar -xf /home/runner/work/_temp/3408f808-496d-4442-95b4-6486ce1685c6/cache.tzst -P -C /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT --use-compress-program unzstd
2025-08-14T20:39:59.5842849Z Cache restored successfully
2025-08-14T20:39:59.6012029Z Cache restored from key: node-cache-Linux-x64-npm-9a18259fac7913a495886720380a5439d83a5add66f3f6dd036d2fed991eeaa3
2025-08-14T20:39:59.6208509Z ##[group]Run echo "🔍 Build Environment Information:"
2025-08-14T20:39:59.6208971Z [36;1mecho "🔍 Build Environment Information:"[0m
2025-08-14T20:39:59.6209321Z [36;1mecho "Node.js version: $(node --version)"[0m
2025-08-14T20:39:59.6209641Z [36;1mecho "NPM version: $(npm --version)"[0m
2025-08-14T20:39:59.6210184Z [36;1mecho "Working directory: jarvis-chat"[0m
2025-08-14T20:39:59.6210472Z [36;1mecho "Branch: main"[0m
2025-08-14T20:39:59.6210795Z [36;1mecho "Commit SHA: ca0ff9ccfb73a4a03ce8641ea69caca472f554bf"[0m
2025-08-14T20:39:59.6211211Z [36;1mecho "Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT"[0m
2025-08-14T20:39:59.6211590Z [36;1mecho "Workflow: Deploy to VPS"[0m
2025-08-14T20:39:59.6211868Z [36;1mecho "Run ID: 16976177128"[0m
2025-08-14T20:39:59.6300663Z shell: /usr/bin/bash -e {0}
2025-08-14T20:39:59.6300948Z env:
2025-08-14T20:39:59.6301149Z   NODE_VERSION: 20
2025-08-14T20:39:59.6301378Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:39:59.6301677Z ##[endgroup]
2025-08-14T20:39:59.6454986Z 🔍 Build Environment Information:
2025-08-14T20:39:59.6487378Z Node.js version: v20.19.4
2025-08-14T20:39:59.7339016Z NPM version: 10.8.2
2025-08-14T20:39:59.7339648Z Working directory: jarvis-chat
2025-08-14T20:39:59.7340305Z Branch: main
2025-08-14T20:39:59.7340902Z Commit SHA: ca0ff9ccfb73a4a03ce8641ea69caca472f554bf
2025-08-14T20:39:59.7341751Z Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T20:39:59.7342262Z Workflow: Deploy to VPS
2025-08-14T20:39:59.7342524Z Run ID: 16976177128
2025-08-14T20:39:59.7376593Z ##[group]Run echo "📦 Installing dependencies with npm ci..."
2025-08-14T20:39:59.7377080Z [36;1mecho "📦 Installing dependencies with npm ci..."[0m
2025-08-14T20:39:59.7377395Z [36;1m[0m
2025-08-14T20:39:59.7377614Z [36;1m# Clean install to fix lockfile issues[0m
2025-08-14T20:39:59.7377942Z [36;1mif [ -f "package-lock.json" ]; then[0m
2025-08-14T20:39:59.7378262Z [36;1m  echo "🔄 Using existing package-lock.json"[0m
2025-08-14T20:39:59.7378637Z [36;1m  npm ci --production=false --no-audit --prefer-offline[0m
2025-08-14T20:39:59.7378965Z [36;1melse[0m
2025-08-14T20:39:59.7379244Z [36;1m  echo "⚠️ No package-lock.json found, generating new one"[0m
2025-08-14T20:39:59.7379611Z [36;1m  npm install --production=false --no-audit[0m
2025-08-14T20:39:59.7380093Z [36;1mfi[0m
2025-08-14T20:39:59.7380273Z [36;1m[0m
2025-08-14T20:39:59.7380494Z [36;1mecho "✅ Dependencies installed successfully"[0m
2025-08-14T20:39:59.7421291Z shell: /usr/bin/bash -e {0}
2025-08-14T20:39:59.7421586Z env:
2025-08-14T20:39:59.7421770Z   NODE_VERSION: 20
2025-08-14T20:39:59.7422218Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:39:59.7422461Z ##[endgroup]
2025-08-14T20:39:59.7482334Z 📦 Installing dependencies with npm ci...
2025-08-14T20:39:59.7482791Z 🔄 Using existing package-lock.json
2025-08-14T20:39:59.8450711Z npm warn config production Use `--omit=dev` instead.
2025-08-14T20:40:01.9243998Z npm warn reify invalid or damaged lockfile detected
2025-08-14T20:40:01.9244861Z npm warn reify please re-try this operation once it completes
2025-08-14T20:40:01.9245739Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T20:40:01.9246662Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T20:40:01.9257964Z npm warn reify invalid or damaged lockfile detected
2025-08-14T20:40:01.9259677Z npm warn reify please re-try this operation once it completes
2025-08-14T20:40:01.9261117Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T20:40:01.9262635Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T20:40:01.9270539Z npm warn reify invalid or damaged lockfile detected
2025-08-14T20:40:02.7025267Z npm warn reify please re-try this operation once it completes
2025-08-14T20:40:02.7025829Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T20:40:02.7026367Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T20:40:02.7026831Z npm warn reify invalid or damaged lockfile detected
2025-08-14T20:40:02.7027300Z npm warn reify please re-try this operation once it completes
2025-08-14T20:40:02.7027792Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T20:40:02.7028293Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T20:40:02.7029020Z npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
2025-08-14T20:40:10.9862046Z 
2025-08-14T20:40:10.9863122Z > jarvis-chat@0.0.0 prepare
2025-08-14T20:40:10.9863815Z > is-ci || husky
2025-08-14T20:40:10.9877777Z 
2025-08-14T20:40:11.0343905Z 
2025-08-14T20:40:11.0344703Z added 602 packages in 11s
2025-08-14T20:40:11.0345032Z 
2025-08-14T20:40:11.0345474Z 121 packages are looking for funding
2025-08-14T20:40:11.0345961Z   run `npm fund` for details
2025-08-14T20:40:11.0864297Z ✅ Dependencies installed successfully
2025-08-14T20:40:11.0894200Z ##[group]Run echo "🔍 Validating project configuration..."
2025-08-14T20:40:11.0894641Z [36;1mecho "🔍 Validating project configuration..."[0m
2025-08-14T20:40:11.0894932Z [36;1m[0m
2025-08-14T20:40:11.0895192Z [36;1m# Check package.json exists and has required scripts[0m
2025-08-14T20:40:11.0895532Z [36;1mif [ ! -f "package.json" ]; then[0m
2025-08-14T20:40:11.0895815Z [36;1m  echo "❌ package.json not found"[0m
2025-08-14T20:40:11.0896071Z [36;1m  exit 1[0m
2025-08-14T20:40:11.0896246Z [36;1mfi[0m
2025-08-14T20:40:11.0896415Z [36;1m[0m
2025-08-14T20:40:11.0896606Z [36;1m# Verify required scripts exist[0m
2025-08-14T20:40:11.0896961Z [36;1mif ! npm run --silent 2>/dev/null | grep -q "test\|build\|lint"; then[0m
2025-08-14T20:40:11.0897377Z [36;1m  echo "⚠️ Some required scripts may be missing"[0m
2025-08-14T20:40:11.0897653Z [36;1mfi[0m
2025-08-14T20:40:11.0897812Z [36;1m[0m
2025-08-14T20:40:11.0897990Z [36;1m# Check critical files exist[0m
2025-08-14T20:40:11.0898302Z [36;1mif [ ! -f "vite.config.ts" ]; then[0m
2025-08-14T20:40:11.0898623Z [36;1m  echo "⚠️ vite.config.ts not found - build may fail"[0m
2025-08-14T20:40:11.0898899Z [36;1mfi[0m
2025-08-14T20:40:11.0899059Z [36;1m[0m
2025-08-14T20:40:11.0899246Z [36;1mif [ ! -f "tsconfig.json" ]; then[0m
2025-08-14T20:40:11.0899597Z [36;1m  echo "⚠️ tsconfig.json not found - TypeScript compilation may fail"[0m
2025-08-14T20:40:11.0907300Z [36;1mfi[0m
2025-08-14T20:40:11.0907483Z [36;1m[0m
2025-08-14T20:40:11.0907706Z [36;1mecho "✅ Environment validation completed"[0m
2025-08-14T20:40:11.0950151Z shell: /usr/bin/bash -e {0}
2025-08-14T20:40:11.0950390Z env:
2025-08-14T20:40:11.0950737Z   NODE_VERSION: 20
2025-08-14T20:40:11.0950948Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:40:11.0951182Z ##[endgroup]
2025-08-14T20:40:11.1013244Z 🔍 Validating project configuration...
2025-08-14T20:40:11.2188926Z ⚠️ Some required scripts may be missing
2025-08-14T20:40:11.2190412Z ✅ Environment validation completed
2025-08-14T20:40:11.2216688Z ##[group]Run echo "🧪 Running test suite..."
2025-08-14T20:40:11.2217063Z [36;1mecho "🧪 Running test suite..."[0m
2025-08-14T20:40:11.2217323Z [36;1m[0m
2025-08-14T20:40:11.2217557Z [36;1m# Set Node.js memory limit to prevent OOM errors[0m
2025-08-14T20:40:11.2217916Z [36;1mexport NODE_OPTIONS="--max-old-space-size=4096"[0m
2025-08-14T20:40:11.2218202Z [36;1m[0m
2025-08-14T20:40:11.2218465Z [36;1m# Run tests with proper error handling and memory optimization[0m
2025-08-14T20:40:11.2218819Z [36;1mif npm run test:ci; then[0m
2025-08-14T20:40:11.2219098Z [36;1m  echo "✅ All tests passed successfully"[0m
2025-08-14T20:40:11.2219387Z [36;1melse[0m
2025-08-14T20:40:11.2219582Z [36;1m  echo "❌ Tests failed"[0m
2025-08-14T20:40:11.2219807Z [36;1m  [0m
2025-08-14T20:40:11.2220283Z [36;1m  # Check if force deploy is enabled[0m
2025-08-14T20:40:11.2220695Z [36;1m  if [ "" = "true" ]; then[0m
2025-08-14T20:40:11.2221078Z [36;1m    echo "⚠️ Force deploy enabled - continuing despite test failures"[0m
2025-08-14T20:40:11.2221417Z [36;1m  else[0m
2025-08-14T20:40:11.2221660Z [36;1m    echo "🛑 Deployment cancelled due to test failures"[0m
2025-08-14T20:40:11.2221951Z [36;1m    exit 1[0m
2025-08-14T20:40:11.2222139Z [36;1m  fi[0m
2025-08-14T20:40:11.2222309Z [36;1mfi[0m
2025-08-14T20:40:11.2265313Z shell: /usr/bin/bash -e {0}
2025-08-14T20:40:11.2265673Z env:
2025-08-14T20:40:11.2265896Z   NODE_VERSION: 20
2025-08-14T20:40:11.2266205Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:40:11.2266502Z ##[endgroup]
2025-08-14T20:40:11.2325942Z 🧪 Running test suite...
2025-08-14T20:40:11.3494556Z 
2025-08-14T20:40:11.3495105Z > jarvis-chat@0.0.0 test:ci
2025-08-14T20:40:11.3495669Z > node scripts/force-exit-after-tests.cjs
2025-08-14T20:40:11.3495912Z 
2025-08-14T20:40:11.3835492Z 🚀 Force Exit Test Runner: Will exit immediately after test completion
2025-08-14T20:40:12.0765732Z 
2025-08-14T20:40:12.0768143Z [1m[46m RUN [49m[22m [36mv3.2.4 [39m[90m/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat[39m
2025-08-14T20:40:12.0768946Z 
2025-08-14T20:40:13.2163787Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mComplete Bug Lifecycle Workflow[2m > [22mprocesses complete bug lifecycle from open to closed[32m 9[2mms[22m[39m
2025-08-14T20:40:13.2167576Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mComplete Bug Lifecycle Workflow[2m > [22mhandles escalation workflow correctly[32m 2[2mms[22m[39m
2025-08-14T20:40:13.2171142Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mNotification Integration[2m > [22msends notifications throughout bug lifecycle[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2174235Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mNotification Integration[2m > [22mrespects user notification preferences[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2177238Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mCommunication and Collaboration[2m > [22mhandles threaded discussions correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2180228Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mCommunication and Collaboration[2m > [22mtracks audit trail for all activities[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2181938Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mFeedback Integration[2m > [22mprocesses feedback lifecycle correctly[32m 2[2mms[22m[39m
2025-08-14T20:40:13.2184021Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mPerformance and Scalability[2m > [22mhandles concurrent operations efficiently[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2185599Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mPerformance and Scalability[2m > [22mmaintains data consistency under load[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2187085Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mError Handling and Recovery[2m > [22mhandles service failures gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2188590Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mError Handling and Recovery[2m > [22mvalidates state transitions correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2190349Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mIntegration with Monitoring[2m > [22mtracks all lifecycle events for monitoring[32m 3[2mms[22m[39m
2025-08-14T20:40:13.2191929Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mWorkflow Optimization[2m > [22moptimizes assignment recommendations based on workload[32m 1[2mms[22m[39m
2025-08-14T20:40:13.2193552Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mWorkflow Optimization[2m > [22mprovides workload balancing recommendations[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0251578Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 3)
2025-08-14T20:40:14.0252994Z (Use `node --trace-warnings ...` to show where the warning was created)
2025-08-14T20:40:14.0338478Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 10)
2025-08-14T20:40:14.0360447Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 14)
2025-08-14T20:40:14.0420375Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 18)
2025-08-14T20:40:14.0433717Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 22)
2025-08-14T20:40:14.0460821Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 27)
2025-08-14T20:40:14.0469158Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 31)
2025-08-14T20:40:14.0607649Z (node:2219) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 33)
2025-08-14T20:40:14.0835081Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould send message successfully with valid payload[32m 9[2mms[22m[39m
2025-08-14T20:40:14.0838324Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould include request metadata in payload[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0841620Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould handle response with additional fields[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0844625Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould throw validation error for missing webhook URL[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0847163Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle HTTP error responses[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0850162Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle network errors[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0852626Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle timeout errors[32m 3[2mms[22m[39m
2025-08-14T20:40:14.0853930Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle malformed response format[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0855214Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle webhook response with success: false[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0856644Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould retry on retryable errors with fake timer advancement[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0858092Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould not retry on non-retryable errors[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0859395Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould respect max attempts[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0861055Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould calculate exponential backoff delays[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0862527Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould not retry on 4xx client errors (except 408, 429)[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0863936Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould retry on retryable HTTP status codes[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0865401Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould open circuit after failure threshold with fake timers[32m 4[2mms[22m[39m
2025-08-14T20:40:14.0866769Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould reset circuit breaker on successful request[32m 7[2mms[22m[39m
2025-08-14T20:40:14.0868118Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould provide circuit breaker configuration methods[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0869412Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould allow manual circuit breaker reset[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0870963Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould validate required payload fields[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0872309Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould include optional payload fields when provided[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0873683Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould validate webhook response format strictly[32m 3[2mms[22m[39m
2025-08-14T20:40:14.0874941Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould track request metrics[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0876343Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould track error metrics on failures[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0877736Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould calculate percentile response times[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0879054Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould include last request timestamp in metrics[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0880417Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mHealth Check[2m > [22mshould perform health check successfully[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0881617Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mHealth Check[2m > [22mshould return unhealthy status on errors[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0882872Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mConcurrent Request Handling[2m > [22mshould handle multiple concurrent requests[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0884267Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mConcurrent Request Handling[2m > [22mshould handle mixed success/failure in concurrent requests[32m 2[2mms[22m[39m
2025-08-14T20:40:14.0885708Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould include authorization header when secret is provided[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0887148Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould include standard headers in all requests[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0889121Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould generate unique request IDs[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0891066Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mTimer Management and Cleanup[2m > [22mshould not have pending timers after operation completion[32m 1[2mms[22m[39m
2025-08-14T20:40:14.0893418Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mTimer Management and Cleanup[2m > [22mshould clean up resources on destroy[32m 1[2mms[22m[39m
2025-08-14T20:40:15.2991295Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould create webhook configuration with admin permissions[32m 30[2mms[22m[39m
2025-08-14T20:40:15.2997913Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould return 401 for missing admin permissions[32m 5[2mms[22m[39m
2025-08-14T20:40:15.3005540Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould validate webhook configuration[32m 11[2mms[22m[39m
2025-08-14T20:40:15.3008391Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould support different authentication types[32m 11[2mms[22m[39m
2025-08-14T20:40:15.3011520Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould support event filtering[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3014429Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform pattern analysis[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3018253Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform resolution analysis[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3022028Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform severity classification[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3025164Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform duplicate detection[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3028350Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform user impact analysis[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3031884Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould return 400 for invalid analysis type[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3035122Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould return 404 for non-existent bug[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3038272Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould support analysis context options[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3041709Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould setup Sentry integration with admin permissions[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3044830Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould return 401 for missing admin permissions[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3047712Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould validate Sentry configuration[32m 4[2mms[22m[39m
2025-08-14T20:40:15.3050775Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould handle connection test failures[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3053785Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould setup DataDog integration with admin permissions[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3056900Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould return 401 for missing admin permissions[32m 2[2mms[22m[39m
2025-08-14T20:40:15.3576370Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould validate DataDog configuration[32m 8[2mms[22m[39m
2025-08-14T20:40:15.3579115Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould support different DataDog sites[32m 9[2mms[22m[39m
2025-08-14T20:40:15.3582961Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations/:id/status[2m > [22mshould return integration status[32m 8[2mms[22m[39m
2025-08-14T20:40:15.3585361Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations/:id/status[2m > [22mshould return 404 for non-existent integration[32m 6[2mms[22m[39m
2025-08-14T20:40:15.3587316Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations[2m > [22mshould list all integrations with summary[32m 6[2mms[22m[39m
2025-08-14T20:40:15.3589187Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for Sentry correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:15.3590999Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for DataDog correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:15.3592568Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for Slack correctly[32m 15[2mms[22m[39m
2025-08-14T20:40:15.3594198Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould get delivery statistics[32m 1[2mms[22m[39m
2025-08-14T20:40:15.3596863Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mError Handling[2m > [22mshould handle malformed webhook configurations[32m 3[2mms[22m[39m
2025-08-14T20:40:15.3599640Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mError Handling[2m > [22mshould handle service unavailability gracefully[32m 2[2mms[22m[39m
2025-08-14T20:40:16.4482501Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould create export request with export permissions[32m 30[2mms[22m[39m
2025-08-14T20:40:16.4485249Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould return 401 for missing export permissions[32m 5[2mms[22m[39m
2025-08-14T20:40:16.4487941Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould validate export format[32m 4[2mms[22m[39m
2025-08-14T20:40:16.4490631Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould support all valid export formats[32m 15[2mms[22m[39m
2025-08-14T20:40:16.4493268Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould apply export templates[32m 3[2mms[22m[39m
2025-08-14T20:40:16.4495963Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould return 503 when export queue is full[32m 12[2mms[22m[39m
2025-08-14T20:40:16.4498740Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould return export status for valid export ID[32m 6[2mms[22m[39m
2025-08-14T20:40:16.4501423Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould return 404 for non-existent export ID[32m 3[2mms[22m[39m
2025-08-14T20:40:16.9561465Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould include progress for processing exports[32m 107[2mms[22m[39m
2025-08-14T20:40:17.0567909Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id/download[2m > [22mshould download completed export file[33m 508[2mms[22m[39m
2025-08-14T20:40:17.0571273Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id/download[2m > [22mshould return 400 for incomplete export[32m 4[2mms[22m[39m
2025-08-14T20:40:17.0572904Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould create scheduled export with admin permissions[32m 3[2mms[22m[39m
2025-08-14T20:40:17.0574407Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould return 401 for missing admin permissions[32m 4[2mms[22m[39m
2025-08-14T20:40:17.0575804Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould validate schedule configuration[32m 4[2mms[22m[39m
2025-08-14T20:40:17.0577223Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould support different schedule frequencies[32m 9[2mms[22m[39m
2025-08-14T20:40:17.0578660Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/templates[2m > [22mshould return available export templates[32m 4[2mms[22m[39m
2025-08-14T20:40:17.0580261Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/templates[2m > [22mshould filter templates by user access[32m 7[2mms[22m[39m
2025-08-14T20:40:17.0581566Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould handle large dataset exports[32m 21[2mms[22m[39m
2025-08-14T20:40:17.4238899Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould apply field selection correctly[32m 205[2mms[22m[39m
2025-08-14T20:40:17.4357815Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould handle export failures gracefully[32m 206[2mms[22m[39m
2025-08-14T20:40:17.4360196Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mCustom Processing Options[2m > [22mshould apply data anonymization when requested[32m 3[2mms[22m[39m
2025-08-14T20:40:17.4361509Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mCustom Processing Options[2m > [22mshould flatten nested objects when requested[32m 3[2mms[22m[39m
2025-08-14T20:40:18.1970267Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate a basic valid payload[32m 4[2mms[22m[39m
2025-08-14T20:40:18.1973761Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate payload with all optional fields[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1976746Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with missing required fields[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1979255Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with invalid field types[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1982643Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with extra unknown fields[32m 0[2mms[22m[39m
2025-08-14T20:40:18.1985532Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate message length constraints[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1989057Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate all supported message types[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1991857Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate all supported tool IDs[32m 0[2mms[22m[39m
2025-08-14T20:40:18.1993372Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate UUID format strictly[32m 2[2mms[22m[39m
2025-08-14T20:40:18.1994854Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould validate enhanced payload with metadata[32m 2[2mms[22m[39m
2025-08-14T20:40:18.1996455Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould apply default values for optional metadata fields[32m 0[2mms[22m[39m
2025-08-14T20:40:18.1998007Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould validate tool selection metadata structure[32m 1[2mms[22m[39m
2025-08-14T20:40:18.1999524Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate successful webhook response[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2001206Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate error webhook response[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2002655Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould reject response with invalid structure[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2004083Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate optional response fields[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2005477Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate healthy status response[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2006901Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate degraded status response[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2008361Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould reject invalid health status values[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2009840Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate minimal health check response[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2011358Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mValidation Error Schema[2m > [22mshould create properly structured validation errors[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2013490Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould create validated payload with createValidatedPayload[32m 4[2mms[22m[39m
2025-08-14T20:40:18.2015225Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould throw error for invalid payload construction[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2018191Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould provide validation summary[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2020092Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould provide detailed validation summary for invalid payload[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2021611Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould handle edge cases in validation summary[32m 1[2mms[22m[39m
2025-08-14T20:40:18.2023010Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mSchema Integration Tests[2m > [22mshould work with real-world payload example[32m 0[2mms[22m[39m
2025-08-14T20:40:18.2024454Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mSchema Integration Tests[2m > [22mshould handle complex validation error scenarios[32m 1[2mms[22m[39m
2025-08-14T20:40:19.1862423Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return paginated bugs with valid API key[32m 21[2mms[22m[39m
2025-08-14T20:40:19.1864657Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return 401 for invalid API key[32m 8[2mms[22m[39m
2025-08-14T20:40:19.1866646Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return 401 for missing API key[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1868670Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould apply status filters correctly[32m 6[2mms[22m[39m
2025-08-14T20:40:19.1890981Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould apply date range filters correctly[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1892965Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould enforce pagination limits[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1894921Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/:id[2m > [22mshould return bug details with valid ID[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1896835Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/:id[2m > [22mshould return 404 for non-existent bug[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1898931Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould update bug status with write permissions[32m 9[2mms[22m[39m
2025-08-14T20:40:19.1901308Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould return 400 for invalid status[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1903404Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould return 401 for insufficient permissions[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1905570Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/:id/assign[2m > [22mshould assign bug with write permissions[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1907630Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/:id/assign[2m > [22mshould return 400 for failed assignment[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1940395Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/search[2m > [22mshould perform text search with results[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1942935Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/search[2m > [22mshould return empty results for no matches[32m 2[2mms[22m[39m
2025-08-14T20:40:19.1944966Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/analytics[2m > [22mshould return analytics data[32m 3[2mms[22m[39m
2025-08-14T20:40:19.1946983Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/analytics[2m > [22mshould use default time range when not specified[32m 2[2mms[22m[39m
2025-08-14T20:40:19.1948866Z  [2m[90m↓[39m[22m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mRate Limiting[2m > [22mshould enforce rate limits
2025-08-14T20:40:19.1950745Z  [2m[90m↓[39m[22m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mError Handling[2m > [22mshould handle database errors gracefully
2025-08-14T20:40:19.1952646Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mError Handling[2m > [22mshould handle service errors gracefully[32m 8[2mms[22m[39m
2025-08-14T20:40:19.1954729Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate required fields for status updates[32m 2[2mms[22m[39m
2025-08-14T20:40:19.1956851Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate required fields for assignments[32m 2[2mms[22m[39m
2025-08-14T20:40:19.1958937Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate pagination parameters[32m 6[2mms[22m[39m
2025-08-14T20:40:19.9452388Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould record successful requests correctly[32m 3[2mms[22m[39m
2025-08-14T20:40:19.9454701Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould record failed requests correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9457311Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould calculate percentiles correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9460285Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould track requests per minute and hour[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9463132Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould determine health status based on metrics[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9465769Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould handle empty metrics gracefully[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9468443Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould maintain performance history size limit[32m 10[2mms[22m[39m
2025-08-14T20:40:19.9471273Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould initialize with default alert rules[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9474178Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould trigger high error rate alert[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9476810Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould trigger slow response time alert[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9479246Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould respect alert cooldown periods[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9481802Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould allow custom alert rules[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9484124Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould allow alert resolution[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9486554Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould generate descriptive alert messages[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9489078Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould generate comprehensive dashboard data[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9491383Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould include performance trends in dashboard data[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9492810Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould limit recent alerts in dashboard data[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9494226Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould allow multiple subscribers[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9495739Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould handle subscriber errors gracefully[32m 2[2mms[22m[39m
2025-08-14T20:40:19.9497203Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould properly unsubscribe callbacks[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9498744Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould infer circuit breaker state from error patterns[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9500513Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould detect half-open circuit breaker state[32m 1[2mms[22m[39m
2025-08-14T20:40:19.9502065Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould show closed circuit breaker for healthy patterns[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9503572Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mData Cleanup and Management[2m > [22mshould clear history and alerts properly[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9505042Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mData Cleanup and Management[2m > [22mshould handle concurrent request recording safely[32m 5[2mms[22m[39m
2025-08-14T20:40:19.9506480Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mSingleton Instance[2m > [22mshould provide working singleton instance[32m 0[2mms[22m[39m
2025-08-14T20:40:19.9508043Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mSingleton Instance[2m > [22mshould maintain state across singleton access[32m 0[2mms[22m[39m
2025-08-14T20:40:20.7352466Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mcompletes full bug report submission workflow[32m 7[2mms[22m[39m
2025-08-14T20:40:20.7354719Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mintegrates error tracking with bug reports[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7356796Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mintegrates performance monitoring[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7358880Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles validation errors properly[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7361224Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles file upload failures gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7363434Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mdetects and prevents duplicate submissions[32m 0[2mms[22m[39m
2025-08-14T20:40:20.7365623Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mprocesses submission queue correctly[32m 55[2mms[22m[39m
2025-08-14T20:40:20.7367805Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mmaintains data integrity throughout the process[32m 2[2mms[22m[39m
2025-08-14T20:40:20.7370217Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles system errors and recovers gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7372405Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mgenerates proper tracking numbers[32m 1[2mms[22m[39m
2025-08-14T20:40:20.7374441Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mmaintains performance under load[32m 17[2mms[22m[39m
2025-08-14T20:40:21.4640666Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22massigns bug to team member successfully[32m 5[2mms[22m[39m
2025-08-14T20:40:21.4643200Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles assignment to non-existent user[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4645614Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles database update failures[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4647970Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mtracks assignment history[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4650164Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles reassignment correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4651473Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mauto-assigns bug successfully[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4652758Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mreturns null when no suitable assignee found[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4654026Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mconsiders workload when auto-assigning[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4655750Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22mgenerates assignment recommendations[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4657258Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22msorts recommendations by confidence[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4658649Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22mconsiders skill matching in recommendations[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4660216Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22mescalates bug priority successfully[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4661526Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22mprevents escalation beyond maximum priority[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4662834Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22msends escalation alerts to managers[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4664120Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mcalculates workload metrics correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4665388Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22midentifies workload imbalances[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4666619Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mupdates team member information[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4667903Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mhandles update of non-existent team member[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4669215Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Rules[2m > [22mapplies assignment rules correctly[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4670816Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Rules[2m > [22mfalls back to recommendations when no rules match[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4672096Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mError Handling[2m > [22mhandles bug fetch errors gracefully[32m 0[2mms[22m[39m
2025-08-14T20:40:21.4673353Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mError Handling[2m > [22mhandles notification failures gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4674655Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPerformance[2m > [22mhandles concurrent assignments without conflicts[32m 1[2mms[22m[39m
2025-08-14T20:40:21.4676019Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPerformance[2m > [22mmaintains reasonable performance with large workload[32m 1[2mms[22m[39m
2025-08-14T20:40:22.1560896Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould validate application environment correctly
2025-08-14T20:40:22.1563823Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould reject invalid environment values
2025-08-14T20:40:22.1566976Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould warn about missing version in production
2025-08-14T20:40:22.1570148Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould validate domain format
2025-08-14T20:40:22.1572824Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould require Supabase URL and key
2025-08-14T20:40:22.1575438Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould validate Supabase URL format
2025-08-14T20:40:22.1578060Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould warn about short Supabase keys
2025-08-14T20:40:22.1580918Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould warn about service role key security
2025-08-14T20:40:22.1583520Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould validate N8N webhook URL format
2025-08-14T20:40:22.1586158Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould require HTTPS for production webhooks
2025-08-14T20:40:22.1588834Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould warn about missing webhook secret
2025-08-14T20:40:22.1590801Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould warn about weak webhook secrets
2025-08-14T20:40:22.1592322Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent debug tools in production
2025-08-14T20:40:22.1593861Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent mock responses in production
2025-08-14T20:40:22.1595370Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent auth bypass outside development
2025-08-14T20:40:22.1596848Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould warn about missing CSP in production
2025-08-14T20:40:22.1598296Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate cache TTL values
2025-08-14T20:40:22.1599781Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate rate limiting configuration
2025-08-14T20:40:22.1601518Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate webhook performance settings
2025-08-14T20:40:22.1603151Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mProduction Readiness[2m > [22mshould identify production-ready configuration
2025-08-14T20:40:22.1604686Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mProduction Readiness[2m > [22mshould identify non-production-ready configuration
2025-08-14T20:40:22.1606069Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould return healthy status for valid configuration
2025-08-14T20:40:22.1607451Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould return error status for invalid configuration
2025-08-14T20:40:22.1608806Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould include metrics in health status
2025-08-14T20:40:22.1610423Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mEnvironment Info[2m > [22mshould return comprehensive environment information
2025-08-14T20:40:22.1612548Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mLogging[2m > [22mshould log environment status without errors
2025-08-14T20:40:22.1614760Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle development environment specifics
2025-08-14T20:40:22.1617132Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle staging environment specifics
2025-08-14T20:40:22.1619595Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle production environment specifics
2025-08-14T20:40:22.9042196Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Development Environment[2m > [22mshould validate complete development setup[32m 4[2mms[22m[39m
2025-08-14T20:40:22.9046741Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Development Environment[2m > [22mshould allow insecure configurations in development[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9050331Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Staging Environment[2m > [22mshould validate complete staging setup[32m 2[2mms[22m[39m
2025-08-14T20:40:22.9052256Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Staging Environment[2m > [22mshould enforce HTTPS in staging[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9054164Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould validate complete production setup[32m 2[2mms[22m[39m
2025-08-14T20:40:22.9056165Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould reject insecure production configurations[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9058191Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould require HTTPS for all external services in production[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9061839Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mHealth Check Integration[2m > [22mshould provide comprehensive health status[32m 2[2mms[22m[39m
2025-08-14T20:40:22.9064514Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mHealth Check Integration[2m > [22mshould detect configuration problems in health checks[32m 2[2mms[22m[39m
2025-08-14T20:40:22.9067606Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mProduction Readiness Assessment[2m > [22mshould correctly assess production readiness[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9070906Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mProduction Readiness Assessment[2m > [22mshould reject non-production-ready configuration[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9073354Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mCross-System Dependencies[2m > [22mshould validate database and webhook integration[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9074925Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mCross-System Dependencies[2m > [22mshould validate monitoring integration[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9076431Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mError Correlation[2m > [22mshould correlate related errors across systems[32m 1[2mms[22m[39m
2025-08-14T20:40:22.9077932Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete System Validation[2m > [22mshould validate entire system health[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6185221Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify strong secrets[32m 2[2mms[22m[39m
2025-08-14T20:40:23.6187729Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify medium strength secrets[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6190304Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify weak secrets[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6192665Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify empty secrets as weak[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6195058Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require Supabase URL and key[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6196529Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require webhook secret in production[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6198010Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require security secrets in production[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6199497Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould not require monitoring secrets in development[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6201143Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect weak security secrets as errors[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6203005Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould warn about client-exposed security secrets[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6204387Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould warn about service role key exposure[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6205733Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect default values in production[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6207074Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect development URLs in production[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6208417Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Categorization[2m > [22mshould categorize secrets correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6209731Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Access Logging[2m > [22mshould log secret access[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6211248Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Access Logging[2m > [22mshould limit audit log size[32m 4[2mms[22m[39m
2025-08-14T20:40:23.6212456Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould track rotation status[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6213714Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould identify overdue rotations[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6214976Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould identify upcoming rotation needs[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6216279Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSummary Generation[2m > [22mshould generate accurate summary[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6217614Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould return healthy status for good configuration[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6218934Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould return warning status for issues[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6220467Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould include rotation status in health check[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6221860Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mEnvironment-Specific Validation[2m > [22mshould be more permissive in development[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6223251Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mEnvironment-Specific Validation[2m > [22mshould be strict in production[32m 0[2mms[22m[39m
2025-08-14T20:40:23.6224584Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mLogging[2m > [22mshould log secrets status without revealing values[32m 1[2mms[22m[39m
2025-08-14T20:40:23.6226002Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mIntegration with Environment Validation[2m > [22mshould complement environment validation[32m 0[2mms[22m[39m
2025-08-14T20:40:24.3715645Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track page load time[32m 5[2mms[22m[39m
2025-08-14T20:40:24.3718010Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track API response times[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3720586Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track API errors for 4xx/5xx status codes[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3722840Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track user interactions[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3724154Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCustom Metrics[2m > [22mshould track custom metrics with tags[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3725348Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCustom Metrics[2m > [22mshould track business events[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3726439Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mUser Tracking[2m > [22mshould set user information[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3727581Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mTransactions[2m > [22mshould create and finish transactions[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3728765Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mTransactions[2m > [22mshould track transaction duration as metric[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3730142Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mError Tracking[2m > [22mshould capture exceptions[32m 6[2mms[22m[39m
2025-08-14T20:40:24.3731353Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mError Tracking[2m > [22mshould capture messages with different levels[32m 0[2mms[22m[39m
2025-08-14T20:40:24.3732521Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCore Web Vitals[2m > [22mshould collect Core Web Vitals[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3733642Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMetrics Filtering[2m > [22mshould filter metrics by name[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3734768Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMetrics Filtering[2m > [22mshould filter metrics by time range[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3735944Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mHealth Monitoring[2m > [22mshould report monitoring health status[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3737173Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mHealth Monitoring[2m > [22mshould report degraded status with many errors[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3738485Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mExternal Integration[2m > [22mshould handle missing external APM services gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3739777Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mExternal Integration[2m > [22mshould send to external services when available[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3741385Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMemory Management[2m > [22mshould limit metrics storage to prevent memory leaks[32m 11[2mms[22m[39m
2025-08-14T20:40:24.3742954Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMemory Management[2m > [22mshould limit events storage to prevent memory leaks[32m 3[2mms[22m[39m
2025-08-14T20:40:24.3744334Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Wrapper[2m > [22mshould wrap functions with monitoring[32m 1[2mms[22m[39m
2025-08-14T20:40:24.3745568Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Wrapper[2m > [22mshould handle function errors and track them[32m 2[2mms[22m[39m
2025-08-14T20:40:25.1569827Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mMessage Sending Success Scenarios[2m > [22mshould send message successfully with valid payload[32m 5[2mms[22m[39m
2025-08-14T20:40:25.1572229Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mMessage Sending Success Scenarios[2m > [22mshould include request metadata in payload[32m 1[2mms[22m[39m
2025-08-14T20:40:25.1574160Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould throw validation error for missing webhook URL[32m 1[2mms[22m[39m
2025-08-14T20:40:25.6685259Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle HTTP error responses[33m 302[2mms[22m[39m
2025-08-14T20:40:25.7698327Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle network errors[33m 302[2mms[22m[39m
2025-08-14T20:40:25.7700807Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle malformed response format[32m 1[2mms[22m[39m
2025-08-14T20:40:26.0723414Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mBasic Retry Logic[2m > [22mshould retry on retryable errors and eventually succeed[33m 302[2mms[22m[39m
2025-08-14T20:40:26.0726302Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mBasic Retry Logic[2m > [22mshould not retry on non-retryable errors[32m 2[2mms[22m[39m
2025-08-14T20:40:26.0728439Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mWebhook Payload Validation[2m > [22mshould validate required payload fields[32m 1[2mms[22m[39m
2025-08-14T20:40:26.0730769Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mWebhook Payload Validation[2m > [22mshould include optional payload fields when provided[32m 1[2mms[22m[39m
2025-08-14T20:40:26.0732600Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mPerformance and Metrics[2m > [22mshould track request metrics on success[32m 1[2mms[22m[39m
2025-08-14T20:40:26.3795108Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mPerformance and Metrics[2m > [22mshould track error metrics on failures[33m 302[2mms[22m[39m
2025-08-14T20:40:26.3796932Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mHealth Check[2m > [22mshould perform health check successfully[32m 1[2mms[22m[39m
2025-08-14T20:40:26.5879051Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mHealth Check[2m > [22mshould return unhealthy status on errors[33m 302[2mms[22m[39m
2025-08-14T20:40:26.5881835Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould include standard headers in all requests[32m 1[2mms[22m[39m
2025-08-14T20:40:26.5883833Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould generate unique request IDs[32m 1[2mms[22m[39m
2025-08-14T20:40:26.5885369Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould provide circuit breaker configuration methods[32m 0[2mms[22m[39m
2025-08-14T20:40:26.5886859Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould allow manual circuit breaker reset[32m 0[2mms[22m[39m
2025-08-14T20:40:27.5032751Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould create enhanced error reports with session info[32m 7[2mms[22m[39m
2025-08-14T20:40:27.5036554Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould generate fingerprints for error grouping[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5039091Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould include release and environment information[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5041524Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould add breadcrumbs with proper categorization[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5043259Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould limit breadcrumb storage[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5044929Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould include breadcrumbs in error reports[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5046653Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAPI Failure Tracking[2m > [22mshould track API failures with detailed context[32m 2[2mms[22m[39m
2025-08-14T20:40:27.5048142Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAPI Failure Tracking[2m > [22mshould add breadcrumbs for API failures[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5049563Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAuthentication Error Tracking[2m > [22mshould track auth errors with context[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5051125Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAuthentication Error Tracking[2m > [22mshould add breadcrumbs for auth events[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5052502Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mUser Action Tracking[2m > [22mshould track user actions as breadcrumbs[32m 0[2mms[22m[39m
2025-08-14T20:40:27.5053843Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mUser Action Tracking[2m > [22mshould handle different action types[32m 0[2mms[22m[39m
2025-08-14T20:40:27.5055138Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould set and retrieve tags[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5056455Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould merge tags when setting multiple times[32m 0[2mms[22m[39m
2025-08-14T20:40:27.5058290Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould include tags in error reports[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5059660Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mSession Integration[2m > [22mshould include session ID in error reports[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5061107Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mSession Integration[2m > [22mshould set user context[32m 0[2mms[22m[39m
2025-08-14T20:40:27.5062421Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mPerformance[2m > [22mshould handle high volume of errors efficiently[32m 56[2mms[22m[39m
2025-08-14T20:40:27.5491249Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mPerformance[2m > [22mshould limit stored errors to prevent memory leaks[32m 132[2mms[22m[39m
2025-08-14T20:40:27.5493958Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould persist errors to localStorage[32m 3[2mms[22m[39m
2025-08-14T20:40:27.5496448Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould persist breadcrumbs to localStorage[32m 1[2mms[22m[39m
2025-08-14T20:40:27.5497864Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould handle localStorage errors gracefully[32m 2[2mms[22m[39m
2025-08-14T20:40:27.5499367Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mExternal Monitoring Integration[2m > [22mshould send errors to external monitoring asynchronously[32m 26[2mms[22m[39m
2025-08-14T20:40:27.5501255Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mExternal Monitoring Integration[2m > [22mshould send breadcrumbs to external monitoring[32m 11[2mms[22m[39m
2025-08-14T20:40:28.2694366Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.template for development[32m 3[2mms[22m[39m
2025-08-14T20:40:28.2696665Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.staging.template for staging[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2698265Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.production.template for production[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2700186Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include all required variables in development template[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2701870Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include production-specific variables in production template[32m 0[2mms[22m[39m
2025-08-14T20:40:28.2703523Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include staging-specific variables in staging template[32m 0[2mms[22m[39m
2025-08-14T20:40:28.2705051Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mSecurity Annotations[2m > [22mshould have security warnings in all templates[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2706952Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mSecurity Annotations[2m > [22mshould mark sensitive variables appropriately[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2708424Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Format Validation[2m > [22mshould use proper environment variable format[32m 2[2mms[22m[39m
2025-08-14T20:40:28.2710037Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Format Validation[2m > [22mshould have consistent variable naming[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2711454Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Completeness[2m > [22mshould cover all configuration categories[32m 0[2mms[22m[39m
2025-08-14T20:40:28.2712934Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Completeness[2m > [22mshould provide example values where appropriate[32m 0[2mms[22m[39m
2025-08-14T20:40:28.2714491Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment-Specific Differences[2m > [22mshould have appropriate differences between environments[32m 1[2mms[22m[39m
2025-08-14T20:40:28.2715989Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mDocumentation Quality[2m > [22mshould have comprehensive comments[32m 1[2mms[22m[39m
2025-08-14T20:40:31.0172253Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use webhook service with proper payload structure[32m 4[2mms[22m[39m
2025-08-14T20:40:31.0174194Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould handle webhook service errors gracefully[32m 2[2mms[22m[39m
2025-08-14T20:40:32.6693302Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use fallback response when circuit breaker is open[33m 2013[2mms[22m[39m
2025-08-14T20:40:32.6807609Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use fallback response when webhook URL not configured[33m 1652[2mms[22m[39m
2025-08-14T20:40:32.6811027Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould include conversation ID in webhook payload when provided[32m 2[2mms[22m[39m
2025-08-14T20:40:32.6814157Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould handle missing conversation ID gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:32.6817104Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould return webhook health status and metrics[32m 1[2mms[22m[39m
2025-08-14T20:40:32.6820204Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould handle health check errors gracefully[32m 0[2mms[22m[39m
2025-08-14T20:40:32.6823115Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould detect when webhook is not configured[32m 0[2mms[22m[39m
2025-08-14T20:40:32.6826960Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mIntegration with Existing Features[2m > [22mshould maintain backward compatibility with existing methods[32m 0[2mms[22m[39m
2025-08-14T20:40:32.6830443Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mIntegration with Existing Features[2m > [22mshould pass conversation ID to enhanced webhook service[32m 1[2mms[22m[39m
2025-08-14T20:40:33.6611237Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould render the tools button with correct selected count[32m 43[2mms[22m[39m
2025-08-14T20:40:33.6614349Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould render compact version correctly[32m 12[2mms[22m[39m
2025-08-14T20:40:33.6617035Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould show loading state[32m 6[2mms[22m[39m
2025-08-14T20:40:33.6620155Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool selection[2m > [22mshould toggle tool selection when checkbox is clicked[32m 32[2mms[22m[39m
2025-08-14T20:40:33.7618426Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool selection[2m > [22mshould display tools grouped by category[32m 15[2mms[22m[39m
2025-08-14T20:40:33.7622611Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mselected tools display[2m > [22mshould show correct selected count in main label[32m 9[2mms[22m[39m
2025-08-14T20:40:33.7625431Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mselected tools display[2m > [22mshould show "No tools selected" message when none are selected[32m 17[2mms[22m[39m
2025-08-14T20:40:33.7628134Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool information display[2m > [22mshould display tool names and descriptions[32m 23[2mms[22m[39m
2025-08-14T20:40:33.7630983Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool information display[2m > [22mshould show helpful message about tool usage[32m 17[2mms[22m[39m
2025-08-14T20:40:33.7633588Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22maccessibility[2m > [22mshould have proper aria-label for the main button[32m 12[2mms[22m[39m
2025-08-14T20:40:33.7636138Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22maccessibility[2m > [22mshould update aria-label when selection changes[32m 12[2mms[22m[39m
2025-08-14T20:40:33.7638656Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22merror handling[2m > [22mshould handle tools loading error gracefully[32m 10[2mms[22m[39m
2025-08-14T20:40:33.7884989Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mdropdown behavior[2m > [22mshould open and close dropdown correctly[32m 12[2mms[22m[39m
2025-08-14T20:40:34.5464106Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22minitialization[2m > [22mshould initialize with default tools when user is not logged in[32m 15[2mms[22m[39m
2025-08-14T20:40:34.5466659Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22minitialization[2m > [22mshould load saved preferences from localStorage when user is logged in[32m 3[2mms[22m[39m
2025-08-14T20:40:34.5469331Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mtool selection[2m > [22mshould toggle tool selection correctly[32m 4[2mms[22m[39m
2025-08-14T20:40:34.5471970Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mtool selection[2m > [22mshould save selections to localStorage when changed[32m 5[2mms[22m[39m
2025-08-14T20:40:34.5474124Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mgetSelectedToolIds[2m > [22mshould return only enabled tool IDs[32m 4[2mms[22m[39m
2025-08-14T20:40:34.5476233Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mpreferences management[2m > [22mshould update preferences correctly[32m 2[2mms[22m[39m
2025-08-14T20:40:34.5478409Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mresetToDefaults[2m > [22mshould reset to default selections and preferences[32m 3[2mms[22m[39m
2025-08-14T20:40:34.5480797Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22merror handling[2m > [22mshould handle localStorage errors gracefully[32m 3[2mms[22m[39m
2025-08-14T20:40:34.5482920Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22manalytics[2m > [22mshould generate session ID when recording usage[32m 3[2mms[22m[39m
2025-08-14T20:40:34.5485027Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22manalytics[2m > [22mshould not record usage when analytics is disabled[32m 5[2mms[22m[39m
2025-08-14T20:40:35.3801900Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mrenders initial bug type selection step[32m 37[2mms[22m[39m
2025-08-14T20:40:35.3804659Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mprogresses through form steps correctly[32m 7[2mms[22m[39m
2025-08-14T20:40:35.3806410Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mvalidates required fields[32m 33[2mms[22m[39m
2025-08-14T20:40:35.3807598Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles form submission successfully[32m 13[2mms[22m[39m
2025-08-14T20:40:35.3808793Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mdisplays success message after submission[32m 4[2mms[22m[39m
2025-08-14T20:40:35.4015892Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles form cancellation[32m 9[2mms[22m[39m
2025-08-14T20:40:35.4017215Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22msupports auto-save functionality[32m 6[2mms[22m[39m
2025-08-14T20:40:35.4018462Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles file attachment uploads[32m 10[2mms[22m[39m
2025-08-14T20:40:36.1019310Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould diagnose webhook connectivity and provide setup guidance[32m 4[2mms[22m[39m
2025-08-14T20:40:36.1022070Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould test webhook response format expectations[32m 0[2mms[22m[39m
2025-08-14T20:40:36.1024269Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould provide n8n workflow setup guidance[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7980888Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould create a new session on initialization[32m 2[2mms[22m[39m
2025-08-14T20:40:36.7983182Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould generate unique session IDs[32m 1[2mms[22m[39m
2025-08-14T20:40:36.7985934Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould collect device information[32m 1[2mms[22m[39m
2025-08-14T20:40:36.7988029Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould set user ID and metadata[32m 1[2mms[22m[39m
2025-08-14T20:40:36.7989337Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould track auth events[32m 1[2mms[22m[39m
2025-08-14T20:40:36.7990685Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould track failed auth events[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7991881Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Analytics[2m > [22mshould calculate session analytics[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7993077Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Analytics[2m > [22mshould track most visited pages[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7994263Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession History[2m > [22mshould maintain session history[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7995461Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession History[2m > [22mshould include current session in history[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7996620Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mError Integration[2m > [22mshould increment error count[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7997833Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mData Persistence[2m > [22mshould attempt to persist session data[32m 0[2mms[22m[39m
2025-08-14T20:40:36.7999092Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mData Persistence[2m > [22mshould handle localStorage errors gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:36.8000542Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mPerformance[2m > [22mshould limit session storage size[32m 1[2mms[22m[39m
2025-08-14T20:40:36.8001791Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mPerformance[2m > [22mshould handle rapid user actions without performance issues[32m 1[2mms[22m[39m
2025-08-14T20:40:36.8003088Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mMemory Management[2m > [22mshould not leak memory with continuous usage[32m 0[2mms[22m[39m
2025-08-14T20:40:37.4930527Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould return valid when all required variables are set[32m 3[2mms[22m[39m
2025-08-14T20:40:37.4933760Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould return errors when required variables are missing[32m 1[2mms[22m[39m
2025-08-14T20:40:37.4935523Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould validate URL format for Supabase URL[32m 1[2mms[22m[39m
2025-08-14T20:40:37.4937099Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould validate JWT format for Supabase anon key[32m 1[2mms[22m[39m
2025-08-14T20:40:37.4938704Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould add warnings for optional missing variables[32m 0[2mms[22m[39m
2025-08-14T20:40:37.4941173Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mgetEnvironmentInfo[2m > [22mshould return correct environment info structure[32m 3[2mms[22m[39m
2025-08-14T20:40:37.4942716Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mgetEnvironmentInfo[2m > [22mshould detect development environment[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1980754Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcreates bug report successfully[32m 4[2mms[22m[39m
2025-08-14T20:40:38.1982261Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcollects enhanced error context[32m 2[2mms[22m[39m
2025-08-14T20:40:38.1983350Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mintegrates with performance metrics[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1984432Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles database submission errors[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1985448Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mlogs submission activity[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1986468Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles missing browser info gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1987508Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcorrelates bug reports with errors[32m 2[2mms[22m[39m
2025-08-14T20:40:38.1988538Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mgenerates correlation IDs for tracking[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1989566Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles network errors gracefully[32m 1[2mms[22m[39m
2025-08-14T20:40:38.1990944Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcollects comprehensive monitoring data[32m 1[2mms[22m[39m
2025-08-14T20:40:38.9177288Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould initialize with correct default state[32m 15[2mms[22m[39m
2025-08-14T20:40:38.9180373Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould detect when app is installed in standalone mode[32m 2[2mms[22m[39m
2025-08-14T20:40:38.9182418Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle beforeinstallprompt event[32m 3[2mms[22m[39m
2025-08-14T20:40:38.9183530Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle successful installation[32m 4[2mms[22m[39m
2025-08-14T20:40:38.9184625Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle installation rejection[32m 3[2mms[22m[39m
2025-08-14T20:40:38.9185666Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle installation error[32m 3[2mms[22m[39m
2025-08-14T20:40:38.9186670Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle appinstalled event[32m 2[2mms[22m[39m
2025-08-14T20:40:38.9187718Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould clear error when clearError is called[32m 3[2mms[22m[39m
2025-08-14T20:40:38.9188865Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould return false for install when no prompt is available[32m 2[2mms[22m[39m
2025-08-14T20:40:39.6310834Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould successfully send message to real n8n webhook
2025-08-14T20:40:39.6312498Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould perform health check successfully
2025-08-14T20:40:39.6313681Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould handle conversation context properly
2025-08-14T20:40:39.6314955Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould demonstrate error recovery and circuit breaker
2025-08-14T20:40:39.6316194Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould test different message types and formats
2025-08-14T20:40:40.4943646Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installed" badge when app is installed[32m 33[2mms[22m[39m
2025-08-14T20:40:40.4945609Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installed" badge when in standalone mode[32m 5[2mms[22m[39m
2025-08-14T20:40:40.4947127Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Web App" badge when PWA is supported but not installed[32m 4[2mms[22m[39m
2025-08-14T20:40:40.4948584Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Browser" badge when PWA is not supported[32m 2[2mms[22m[39m
2025-08-14T20:40:40.4950344Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show install button when canInstall is true and showInstallButton is true[32m 5[2mms[22m[39m
2025-08-14T20:40:40.4951864Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould not show install button when showInstallButton is false[32m 3[2mms[22m[39m
2025-08-14T20:40:40.4953036Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould call install when install button is clicked[32m 7[2mms[22m[39m
2025-08-14T20:40:40.4954189Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installing..." when isInstalling is true[32m 4[2mms[22m[39m
2025-08-14T20:40:40.4955284Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Install App" on mobile devices[32m 4[2mms[22m[39m
2025-08-14T20:40:41.2729515Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould initialize with empty state[32m 14[2mms[22m[39m
2025-08-14T20:40:41.2731621Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould load message history when user logs in[32m 56[2mms[22m[39m
2025-08-14T20:40:41.2733519Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould handle send message successfully[32m 3[2mms[22m[39m
2025-08-14T20:40:41.2734548Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould handle send message error[32m 4[2mms[22m[39m
2025-08-14T20:40:41.2735477Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould not send empty messages[32m 2[2mms[22m[39m
2025-08-14T20:40:41.2736321Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould clear messages[32m 2[2mms[22m[39m
2025-08-14T20:40:41.2737094Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould clear error[32m 2[2mms[22m[39m
2025-08-14T20:40:41.9666847Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould generate correct HMAC-SHA256 signature[32m 3[2mms[22m[39m
2025-08-14T20:40:41.9669519Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould verify GitHub webhook signature correctly[32m 1[2mms[22m[39m
2025-08-14T20:40:41.9671260Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould reject invalid webhook signature[32m 0[2mms[22m[39m
2025-08-14T20:40:41.9672495Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould handle missing signature gracefully[32m 0[2mms[22m[39m
2025-08-14T20:40:41.9673643Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Event Handler Tests[2m > [22mshould handle ping event correctly[32m 0[2mms[22m[39m
2025-08-14T20:40:41.9674747Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Event Handler Tests[2m > [22mshould handle workflow_run event correctly[32m 0[2mms[22m[39m
2025-08-14T20:40:41.9675952Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mEnvironment Variable Tests[2m > [22mshould load webhook secret from environment[32m 1[2mms[22m[39m
2025-08-14T20:40:41.9677188Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mEnvironment Variable Tests[2m > [22mshould use default value when environment variable not set[32m 0[2mms[22m[39m
2025-08-14T20:40:42.8890786Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould not render when canInstall is false[32m 21[2mms[22m[39m
2025-08-14T20:40:42.8893076Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould render install prompt when canInstall is true[32m 33[2mms[22m[39m
2025-08-14T20:40:42.8894986Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould call install when install button is clicked[32m 12[2mms[22m[39m
2025-08-14T20:40:42.8896603Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould show installing state when isInstalling is true[32m 7[2mms[22m[39m
2025-08-14T20:40:42.8898141Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould display error message when installError is present[32m 8[2mms[22m[39m
2025-08-14T20:40:42.8899614Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould dismiss prompt when X button is clicked[32m 9[2mms[22m[39m
2025-08-14T20:40:42.9945803Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould respect showDelay prop[32m 105[2mms[22m[39m
2025-08-14T20:40:42.9995301Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould hide prompt after successful installation[32m 10[2mms[22m[39m
2025-08-14T20:40:48.6329306Z  [32m✓[39m src/lib/__tests__/webhook.live.test.ts[2m > [22mLive Webhook Test[2m > [22mshould test the actual n8n webhook with Hello JARVIS message[33m 4879[2mms[22m[39m
2025-08-14T20:42:11.4866954Z 
2025-08-14T20:42:11.4868744Z 🚨 TIMEOUT: Forcing exit after 2 minutes
2025-08-14T20:42:11.4977692Z ✅ All tests passed successfully
2025-08-14T20:42:16.5021920Z ##[group]Run echo "🔧 Running code linting..."
2025-08-14T20:42:16.5022301Z [36;1mecho "🔧 Running code linting..."[0m
2025-08-14T20:42:16.5022556Z [36;1m[0m
2025-08-14T20:42:16.5022748Z [36;1mif npm run lint; then[0m
2025-08-14T20:42:16.5023013Z [36;1m  echo "✅ Linting passed successfully"[0m
2025-08-14T20:42:16.5023282Z [36;1melse[0m
2025-08-14T20:42:16.5023555Z [36;1m  echo "⚠️ Linting issues found - continuing with deployment"[0m
2025-08-14T20:42:16.5023949Z [36;1m  echo "Note: Fix linting issues in future commits"[0m
2025-08-14T20:42:16.5024229Z [36;1mfi[0m
2025-08-14T20:42:16.5063605Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:16.5063839Z env:
2025-08-14T20:42:16.5064010Z   NODE_VERSION: 20
2025-08-14T20:42:16.5064219Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:16.5064451Z ##[endgroup]
2025-08-14T20:42:16.5127286Z 🔧 Running code linting...
2025-08-14T20:42:16.6201825Z 
2025-08-14T20:42:16.6202342Z > jarvis-chat@0.0.0 lint
2025-08-14T20:42:16.6202873Z > eslint .
2025-08-14T20:42:16.6203089Z 
2025-08-14T20:42:23.6584576Z ✅ Linting passed successfully
2025-08-14T20:42:23.6624564Z ##[group]Run echo "📊 Running TypeScript type checking..."
2025-08-14T20:42:23.6625328Z [36;1mecho "📊 Running TypeScript type checking..."[0m
2025-08-14T20:42:23.6625815Z [36;1m[0m
2025-08-14T20:42:23.6626185Z [36;1mif npm run type-check; then[0m
2025-08-14T20:42:23.6626680Z [36;1m  echo "✅ Type checking passed successfully"[0m
2025-08-14T20:42:23.6627180Z [36;1melse[0m
2025-08-14T20:42:23.6627555Z [36;1m  echo "❌ Type checking failed"[0m
2025-08-14T20:42:23.6628057Z [36;1m  [0m
2025-08-14T20:42:23.6628431Z [36;1m  # Check if force deploy is enabled[0m
2025-08-14T20:42:23.6628903Z [36;1m  if [ "" = "true" ]; then[0m
2025-08-14T20:42:23.6629482Z [36;1m    echo "⚠️ Force deploy enabled - continuing despite type errors"[0m
2025-08-14T20:42:23.6630291Z [36;1m  else[0m
2025-08-14T20:42:23.6630723Z [36;1m    echo "🛑 Deployment cancelled due to type errors"[0m
2025-08-14T20:42:23.6631250Z [36;1m    exit 1[0m
2025-08-14T20:42:23.6631590Z [36;1m  fi[0m
2025-08-14T20:42:23.6631958Z [36;1mfi[0m
2025-08-14T20:42:23.6690681Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:23.6691109Z env:
2025-08-14T20:42:23.6691421Z   NODE_VERSION: 20
2025-08-14T20:42:23.6691799Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:23.6692203Z ##[endgroup]
2025-08-14T20:42:23.6782180Z 📊 Running TypeScript type checking...
2025-08-14T20:42:23.7903813Z 
2025-08-14T20:42:23.7904963Z > jarvis-chat@0.0.0 type-check
2025-08-14T20:42:23.7906386Z > tsc --noEmit
2025-08-14T20:42:23.7906665Z 
2025-08-14T20:42:23.9647707Z ✅ Type checking passed successfully
2025-08-14T20:42:23.9686223Z ##[group]Run echo "🏗️ Building application for production..."
2025-08-14T20:42:23.9686987Z [36;1mecho "🏗️ Building application for production..."[0m
2025-08-14T20:42:23.9687521Z [36;1m[0m
2025-08-14T20:42:23.9687851Z [36;1m# Set build environment[0m
2025-08-14T20:42:23.9688317Z [36;1mexport NODE_ENV=production[0m
2025-08-14T20:42:23.9688739Z [36;1m[0m
2025-08-14T20:42:23.9689061Z [36;1mif npm run build; then[0m
2025-08-14T20:42:23.9689537Z [36;1m  echo "✅ Build completed successfully"[0m
2025-08-14T20:42:23.9690248Z [36;1m  [0m
2025-08-14T20:42:23.9690585Z [36;1m  # Display build info[0m
2025-08-14T20:42:23.9691000Z [36;1m  if [ -d "dist" ]; then[0m
2025-08-14T20:42:23.9691435Z [36;1m    echo "📊 Build artifacts:"[0m
2025-08-14T20:42:23.9691890Z [36;1m    ls -la dist/[0m
2025-08-14T20:42:23.9692270Z [36;1m    du -sh dist/[0m
2025-08-14T20:42:23.9692689Z [36;1m  fi[0m
2025-08-14T20:42:23.9693324Z [36;1melse[0m
2025-08-14T20:42:23.9693699Z [36;1m  echo "❌ Build failed"[0m
2025-08-14T20:42:23.9694109Z [36;1m  exit 1[0m
2025-08-14T20:42:23.9694419Z [36;1mfi[0m
2025-08-14T20:42:23.9736742Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:23.9736982Z env:
2025-08-14T20:42:23.9737156Z   NODE_VERSION: 20
2025-08-14T20:42:23.9737364Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:23.9737600Z ##[endgroup]
2025-08-14T20:42:23.9795948Z 🏗️ Building application for production...
2025-08-14T20:42:24.0982913Z 
2025-08-14T20:42:24.0984042Z > jarvis-chat@0.0.0 build
2025-08-14T20:42:24.0985237Z > vite build
2025-08-14T20:42:24.0985431Z 
2025-08-14T20:42:24.3223497Z [36mvite v7.0.6 [32mbuilding for production...[36m[39m
2025-08-14T20:42:24.6375587Z transforming...
2025-08-14T20:42:32.4923273Z [32m✓[39m 2854 modules transformed.
2025-08-14T20:42:33.0929380Z rendering chunks...
2025-08-14T20:42:33.1452735Z [33m[plugin vite:reporter] 
2025-08-14T20:42:33.1456250Z (!) /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/sessionTracking.ts is dynamically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts but also statically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/contexts/AuthContext.tsx, dynamic import will not move module into another chunk.
2025-08-14T20:42:33.1458958Z [39m
2025-08-14T20:42:33.1459431Z [33m[plugin vite:reporter] 
2025-08-14T20:42:33.1463760Z (!) /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/externalMonitoring.ts is dynamically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts, /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts but also statically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/contexts/AuthContext.tsx, dynamic import will not move module into another chunk.
2025-08-14T20:42:33.1467003Z [39m
2025-08-14T20:42:33.3853593Z computing gzip size...
2025-08-14T20:42:33.4158614Z [2mdist/[22m[32mindex.html                          [39m[1m[2m  2.23 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m
2025-08-14T20:42:33.4160509Z [2mdist/[22m[2massets/[22m[35mmain-DyCW2CH7.css            [39m[1m[2m 53.99 kB[22m[1m[22m[2m │ gzip:   9.92 kB[22m
2025-08-14T20:42:33.4162198Z [2mdist/[22m[2massets/[22m[36mvendor-query-DJprwG_K.js     [39m[1m[2m  0.07 kB[22m[1m[22m[2m │ gzip:   0.07 kB[22m
2025-08-14T20:42:33.4163861Z [2mdist/[22m[2massets/[22m[36mLoginPage-Cu1uydeP.js        [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
2025-08-14T20:42:33.4165324Z [2mdist/[22m[36msw.js                               [39m[1m[2m  1.26 kB[22m[1m[22m[2m │ gzip:   0.64 kB[22m
2025-08-14T20:42:33.4166824Z [2mdist/[22m[2massets/[22m[36mNotFound-DGr8NtoP.js         [39m[1m[2m  1.73 kB[22m[1m[22m[2m │ gzip:   0.68 kB[22m
2025-08-14T20:42:33.4169119Z [2mdist/[22m[2massets/[22m[36mChatPage-B2KOMn2Q.js         [39m[1m[2m  3.14 kB[22m[1m[22m[2m │ gzip:   1.40 kB[22m
2025-08-14T20:42:33.4171093Z [2mdist/[22m[2massets/[22m[36mprofiler-Dj6Kf4y9.js         [39m[1m[2m  5.34 kB[22m[1m[22m[2m │ gzip:   2.45 kB[22m
2025-08-14T20:42:33.4172788Z [2mdist/[22m[2massets/[22m[36mHealthPage-wNPCv5DQ.js       [39m[1m[2m  7.34 kB[22m[1m[22m[2m │ gzip:   1.94 kB[22m
2025-08-14T20:42:33.4174469Z [2mdist/[22m[2massets/[22m[36mTasksPage-D3TLHEwI.js        [39m[1m[2m  7.77 kB[22m[1m[22m[2m │ gzip:   2.15 kB[22m
2025-08-14T20:42:33.4176113Z [2mdist/[22m[2massets/[22m[36mDashboard-B8mpYaWV.js        [39m[1m[2m  8.30 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
2025-08-14T20:42:33.4177789Z [2mdist/[22m[2massets/[22m[36mSettingsPage-C02qJ2xX.js     [39m[1m[2m  9.43 kB[22m[1m[22m[2m │ gzip:   2.36 kB[22m
2025-08-14T20:42:33.4179608Z [2mdist/[22m[2massets/[22m[36mstartRecording-B84evlzu.js   [39m[1m[2m 19.41 kB[22m[1m[22m[2m │ gzip:   7.60 kB[22m
2025-08-14T20:42:33.4181939Z [2mdist/[22m[2massets/[22m[36mvendor-react-2sXmwtUU.js     [39m[1m[2m 44.96 kB[22m[1m[22m[2m │ gzip:  16.06 kB[22m
2025-08-14T20:42:33.4183680Z [2mdist/[22m[2massets/[22m[36mservices-CnM36BHg.js         [39m[1m[2m 61.25 kB[22m[1m[22m[2m │ gzip:  17.93 kB[22m
2025-08-14T20:42:33.4185331Z [2mdist/[22m[2massets/[22m[36mbuild.umd-DxMfbSb1.js        [39m[1m[2m 63.13 kB[22m[1m[22m[2m │ gzip:  17.74 kB[22m
2025-08-14T20:42:33.4186982Z [2mdist/[22m[2massets/[22m[36mvendor-form-BJjVzX-u.js      [39m[1m[2m 71.27 kB[22m[1m[22m[2m │ gzip:  21.61 kB[22m
2025-08-14T20:42:33.4188688Z [2mdist/[22m[2massets/[22m[36mcomponents-auth-CSMafzv6.js  [39m[1m[2m 76.17 kB[22m[1m[22m[2m │ gzip:  21.39 kB[22m
2025-08-14T20:42:33.4190740Z [2mdist/[22m[2massets/[22m[36mvendor-ui-D1hAaaPE.js        [39m[1m[2m 98.19 kB[22m[1m[22m[2m │ gzip:  31.13 kB[22m
2025-08-14T20:42:33.4192492Z [2mdist/[22m[2massets/[22m[36mvendor-supabase-E0f6e1kF.js  [39m[1m[2m117.05 kB[22m[1m[22m[2m │ gzip:  32.42 kB[22m
2025-08-14T20:42:33.4194252Z [2mdist/[22m[2massets/[22m[36mcomponents-chat-CO6-SCDC.js  [39m[1m[2m125.07 kB[22m[1m[22m[2m │ gzip:  36.29 kB[22m
2025-08-14T20:42:33.4195913Z [2mdist/[22m[2massets/[22m[36mmain-CGerczDa.js             [39m[1m[2m149.62 kB[22m[1m[22m[2m │ gzip:  52.07 kB[22m
2025-08-14T20:42:33.4197502Z [2mdist/[22m[2massets/[22m[36mmain-yzTASifi.js             [39m[1m[2m248.20 kB[22m[1m[22m[2m │ gzip:  76.81 kB[22m
2025-08-14T20:42:33.4199101Z [2mdist/[22m[2massets/[22m[36mindex-Dw-dKVai.js            [39m[1m[2m374.66 kB[22m[1m[22m[2m │ gzip: 127.18 kB[22m
2025-08-14T20:42:33.4200266Z [32m✓ built in 9.06s[39m
2025-08-14T20:42:33.4945755Z ✅ Build completed successfully
2025-08-14T20:42:33.4946345Z 📊 Build artifacts:
2025-08-14T20:42:33.4960880Z total 48
2025-08-14T20:42:33.4962790Z drwxr-xr-x  5 runner docker  4096 Aug 14 20:42 .
2025-08-14T20:42:33.4964953Z drwxr-xr-x 14 runner docker  4096 Aug 14 20:42 ..
2025-08-14T20:42:33.4966991Z drwxr-xr-x  2 runner docker  4096 Aug 14 20:42 api
2025-08-14T20:42:33.4967746Z -rw-r--r--  1 runner docker 10611 Aug 14 20:42 api-docs.html
2025-08-14T20:42:33.4968461Z drwxr-xr-x  2 runner docker  4096 Aug 14 20:42 assets
2025-08-14T20:42:33.4969119Z drwxr-xr-x  2 runner docker  4096 Aug 14 20:42 icons
2025-08-14T20:42:33.4969773Z -rw-r--r--  1 runner docker  2226 Aug 14 20:42 index.html
2025-08-14T20:42:33.4970406Z -rw-r--r--  1 runner docker  1255 Aug 14 20:42 manifest.json
2025-08-14T20:42:33.4970826Z -rw-r--r--  1 runner docker  1257 Aug 14 20:42 sw.js
2025-08-14T20:42:33.4971208Z -rw-r--r--  1 runner docker  1497 Aug 14 20:42 vite.svg
2025-08-14T20:42:33.5140293Z 1.7M	dist/
2025-08-14T20:42:33.5180174Z ##[group]Run echo "🔍 Validating build artifacts..."
2025-08-14T20:42:33.5180846Z [36;1mecho "🔍 Validating build artifacts..."[0m
2025-08-14T20:42:33.5181329Z [36;1m[0m
2025-08-14T20:42:33.5181679Z [36;1mif [ ! -d "dist" ]; then[0m
2025-08-14T20:42:33.5182167Z [36;1m  echo "❌ Build directory 'dist' not found"[0m
2025-08-14T20:42:33.5182639Z [36;1m  exit 1[0m
2025-08-14T20:42:33.5182954Z [36;1mfi[0m
2025-08-14T20:42:33.5183248Z [36;1m[0m
2025-08-14T20:42:33.5183594Z [36;1mif [ ! -f "dist/index.html" ]; then[0m
2025-08-14T20:42:33.5184196Z [36;1m  echo "❌ Main index.html not found in build"[0m
2025-08-14T20:42:33.5184675Z [36;1m  exit 1[0m
2025-08-14T20:42:33.5184973Z [36;1mfi[0m
2025-08-14T20:42:33.5185271Z [36;1m[0m
2025-08-14T20:42:33.5185600Z [36;1m# Check for critical assets[0m
2025-08-14T20:42:33.5186134Z [36;1mif ls dist/assets/*.js 1> /dev/null 2>&1; then[0m
2025-08-14T20:42:33.5186663Z [36;1m  echo "✅ JavaScript assets found"[0m
2025-08-14T20:42:33.5187160Z [36;1melse[0m
2025-08-14T20:42:33.5187523Z [36;1m  echo "⚠️ No JavaScript assets found"[0m
2025-08-14T20:42:33.5188075Z [36;1mfi[0m
2025-08-14T20:42:33.5188397Z [36;1m[0m
2025-08-14T20:42:33.5189087Z [36;1mif ls dist/assets/*.css 1> /dev/null 2>&1; then[0m
2025-08-14T20:42:33.5189624Z [36;1m  echo "✅ CSS assets found"[0m
2025-08-14T20:42:33.5190257Z [36;1melse[0m
2025-08-14T20:42:33.5190602Z [36;1m  echo "⚠️ No CSS assets found"[0m
2025-08-14T20:42:33.5191173Z [36;1mfi[0m
2025-08-14T20:42:33.5191704Z [36;1m[0m
2025-08-14T20:42:33.5192224Z [36;1mecho "✅ Build artifacts validation completed"[0m
2025-08-14T20:42:33.5252507Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:33.5253160Z env:
2025-08-14T20:42:33.5253706Z   NODE_VERSION: 20
2025-08-14T20:42:33.5254248Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:33.5254882Z ##[endgroup]
2025-08-14T20:42:33.5389851Z 🔍 Validating build artifacts...
2025-08-14T20:42:33.5405569Z ✅ JavaScript assets found
2025-08-14T20:42:33.5419314Z ✅ CSS assets found
2025-08-14T20:42:33.5420058Z ✅ Build artifacts validation completed
2025-08-14T20:42:33.5445309Z ##[group]Run echo "📤 Preparing deployment metadata..."
2025-08-14T20:42:33.5445733Z [36;1mecho "📤 Preparing deployment metadata..."[0m
2025-08-14T20:42:33.5446034Z [36;1m[0m
2025-08-14T20:42:33.5446226Z [36;1m# Create deployment metadata[0m
2025-08-14T20:42:33.5446516Z [36;1mcat > deployment-metadata.json << EOF[0m
2025-08-14T20:42:33.5446785Z [36;1m{[0m
2025-08-14T20:42:33.5447030Z [36;1m  "repository": "MADPANDA3D/J.A.R.V.I.S-PROJECT",[0m
2025-08-14T20:42:33.5447331Z [36;1m  "branch": "main",[0m
2025-08-14T20:42:33.5447633Z [36;1m  "commit_sha": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",[0m
2025-08-14T20:42:33.5448133Z [36;1m  "commit_message": "fix: resolve vite build warning - static import for centralizedLogging[0m
2025-08-14T20:42:33.5448537Z [36;1m[0m
2025-08-14T20:42:33.5448731Z [36;1m🔧 VITE BUILD WARNING FIX:[0m
2025-08-14T20:42:33.5449086Z [36;1m- Changed dynamic import to static import in databaseLogging.ts[0m
2025-08-14T20:42:33.5449655Z [36;1m- Fixes bundle optimization warning where file was both dynamically and statically imported[0m
2025-08-14T20:42:33.5450421Z [36;1m- Dynamic import was on line 379: await import('./centralizedLogging')[0m
2025-08-14T20:42:33.5450849Z [36;1m- Static import prevents vite chunk splitting confusion[0m
2025-08-14T20:42:33.5451153Z [36;1m[0m
2025-08-14T20:42:33.5451420Z [36;1m**Root Cause:** Mixed import types prevented optimal bundling[0m
2025-08-14T20:42:33.5451825Z [36;1m**Solution:** Consistent static imports across all modules[0m
2025-08-14T20:42:33.5452271Z [36;1m**Warning Fixed:** 'dynamic import will not move module into another chunk'",[0m
2025-08-14T20:42:33.5452654Z [36;1m  "author": "Leo Lara",[0m
2025-08-14T20:42:33.5452903Z [36;1m  "workflow_run_id": "16976177128",[0m
2025-08-14T20:42:33.5453162Z [36;1m  "workflow_run_number": "62",[0m
2025-08-14T20:42:33.5453471Z [36;1m  "build_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",[0m
2025-08-14T20:42:33.5453782Z [36;1m  "node_version": "20",[0m
2025-08-14T20:42:33.5454032Z [36;1m  "environment": "production"[0m
2025-08-14T20:42:33.5454277Z [36;1m}[0m
2025-08-14T20:42:33.5454450Z [36;1mEOF[0m
2025-08-14T20:42:33.5454619Z [36;1m[0m
2025-08-14T20:42:33.5454821Z [36;1mecho "✅ Deployment metadata prepared:"[0m
2025-08-14T20:42:33.5455108Z [36;1mcat deployment-metadata.json[0m
2025-08-14T20:42:33.5493763Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:33.5493999Z env:
2025-08-14T20:42:33.5494167Z   NODE_VERSION: 20
2025-08-14T20:42:33.5494375Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:33.5494603Z ##[endgroup]
2025-08-14T20:42:33.5552289Z 📤 Preparing deployment metadata...
2025-08-14T20:42:33.5576914Z ✅ Deployment metadata prepared:
2025-08-14T20:42:33.5585305Z {
2025-08-14T20:42:33.5586024Z   "repository": "MADPANDA3D/J.A.R.V.I.S-PROJECT",
2025-08-14T20:42:33.5586570Z   "branch": "main",
2025-08-14T20:42:33.5587095Z   "commit_sha": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",
2025-08-14T20:42:33.5588012Z   "commit_message": "fix: resolve vite build warning - static import for centralizedLogging
2025-08-14T20:42:33.5588575Z 
2025-08-14T20:42:33.5589322Z 🔧 VITE BUILD WARNING FIX:
2025-08-14T20:42:33.5590298Z - Changed dynamic import to static import in databaseLogging.ts
2025-08-14T20:42:33.5591312Z - Fixes bundle optimization warning where file was both dynamically and statically imported
2025-08-14T20:42:33.5592372Z - Dynamic import was on line 379: await import('./centralizedLogging')
2025-08-14T20:42:33.5592866Z - Static import prevents vite chunk splitting confusion
2025-08-14T20:42:33.5593109Z 
2025-08-14T20:42:33.5593343Z **Root Cause:** Mixed import types prevented optimal bundling
2025-08-14T20:42:33.5593783Z **Solution:** Consistent static imports across all modules
2025-08-14T20:42:33.5594294Z **Warning Fixed:** 'dynamic import will not move module into another chunk'",
2025-08-14T20:42:33.5594662Z   "author": "Leo Lara",
2025-08-14T20:42:33.5594923Z   "workflow_run_id": "16976177128",
2025-08-14T20:42:33.5595412Z   "workflow_run_number": "62",
2025-08-14T20:42:33.5595714Z   "build_timestamp": "2025-08-14T20:42:33Z",
2025-08-14T20:42:33.5596002Z   "node_version": "20",
2025-08-14T20:42:33.5596220Z   "environment": "production"
2025-08-14T20:42:33.5596460Z }
2025-08-14T20:42:33.5619092Z ##[group]Run echo "🚀 Triggering VPS deployment..."
2025-08-14T20:42:33.5619524Z [36;1mecho "🚀 Triggering VPS deployment..."[0m
2025-08-14T20:42:33.5619798Z [36;1m[0m
2025-08-14T20:42:33.5620233Z [36;1m# Create deployment payload[0m
2025-08-14T20:42:33.5620508Z [36;1mDEPLOYMENT_PAYLOAD=$(cat <<EOF[0m
2025-08-14T20:42:33.5620770Z [36;1m{[0m
2025-08-14T20:42:33.5620956Z [36;1m  "action": "completed",[0m
2025-08-14T20:42:33.5621195Z [36;1m  "workflow_run": {[0m
2025-08-14T20:42:33.5621432Z [36;1m    "conclusion": "success",[0m
2025-08-14T20:42:33.5621747Z [36;1m    "head_sha": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",[0m
2025-08-14T20:42:33.5622080Z [36;1m    "name": "Deploy to VPS"[0m
2025-08-14T20:42:33.5622306Z [36;1m  },[0m
2025-08-14T20:42:33.5622491Z [36;1m  "repository": {[0m
2025-08-14T20:42:33.5622753Z [36;1m    "name": "MADPANDA3D/J.A.R.V.I.S-PROJECT"[0m
2025-08-14T20:42:33.5623040Z [36;1m  },[0m
2025-08-14T20:42:33.5623259Z [36;1m  "pusher": {[0m
2025-08-14T20:42:33.5623475Z [36;1m    "name": "MADPANDA3D"[0m
2025-08-14T20:42:33.5623698Z [36;1m  },[0m
2025-08-14T20:42:33.5623882Z [36;1m  "ref": "refs/heads/main",[0m
2025-08-14T20:42:33.5624119Z [36;1m  "metadata": {[0m
2025-08-14T20:42:33.5624401Z [36;1m    "version": "ca0ff9ccfb73a4a03ce8641ea69caca472f554bf",[0m
2025-08-14T20:42:33.5624714Z [36;1m    "branch": "main",[0m
2025-08-14T20:42:33.5624940Z [36;1m    "build_id": "16976177128",[0m
2025-08-14T20:42:33.5625229Z [36;1m    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",[0m
2025-08-14T20:42:33.5625718Z [36;1m    "workflow_url": "https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT/actions/runs/16976177128"[0m
2025-08-14T20:42:33.5626173Z [36;1m  }[0m
2025-08-14T20:42:33.5626350Z [36;1m}[0m
2025-08-14T20:42:33.5626515Z [36;1mEOF[0m
2025-08-14T20:42:33.5626680Z [36;1m)[0m
2025-08-14T20:42:33.5626844Z [36;1m[0m
2025-08-14T20:42:33.5627034Z [36;1m# Calculate webhook signature[0m
2025-08-14T20:42:33.5627660Z [36;1mWEBHOOK_SECRET="***"[0m
2025-08-14T20:42:33.5628134Z [36;1mSIGNATURE=$(echo -n "$DEPLOYMENT_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)[0m
2025-08-14T20:42:33.5628604Z [36;1m[0m
2025-08-14T20:42:33.5628789Z [36;1m# Send webhook to VPS[0m
2025-08-14T20:42:33.5629125Z [36;1mHTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/webhook_response.txt \[0m
2025-08-14T20:42:33.5629476Z [36;1m  -X POST \[0m
2025-08-14T20:42:33.5629716Z [36;1m  -H "Content-Type: application/json" \[0m
2025-08-14T20:42:33.5630189Z [36;1m  -H "X-GitHub-Event: workflow_run" \[0m
2025-08-14T20:42:33.5630491Z [36;1m  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \[0m
2025-08-14T20:42:33.5630832Z [36;1m  -H "User-Agent: GitHub-Hookshot/deploy-workflow" \[0m
2025-08-14T20:42:33.5631148Z [36;1m  -d "$DEPLOYMENT_PAYLOAD" \[0m
2025-08-14T20:42:33.5631456Z [36;1m  "***/webhook/deploy" \[0m
2025-08-14T20:42:33.5631876Z [36;1m  --connect-timeout 10 \[0m
2025-08-14T20:42:33.5632124Z [36;1m  --max-time 30)[0m
2025-08-14T20:42:33.5632325Z [36;1m[0m
2025-08-14T20:42:33.5632498Z [36;1m# Check response[0m
2025-08-14T20:42:33.5632730Z [36;1mif [ "$HTTP_STATUS" -eq 200 ]; then[0m
2025-08-14T20:42:33.5633066Z [36;1m  echo "✅ VPS deployment webhook sent successfully"[0m
2025-08-14T20:42:33.5633419Z [36;1m  echo "Response:" $(cat /tmp/webhook_response.txt)[0m
2025-08-14T20:42:33.5633705Z [36;1melse[0m
2025-08-14T20:42:33.5633981Z [36;1m  echo "❌ VPS deployment webhook failed with status: $HTTP_STATUS"[0m
2025-08-14T20:42:33.5634396Z [36;1m  echo "Response:" $(cat /tmp/webhook_response.txt)[0m
2025-08-14T20:42:33.5634678Z [36;1m  exit 1[0m
2025-08-14T20:42:33.5634854Z [36;1mfi[0m
2025-08-14T20:42:33.5672934Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:33.5673169Z env:
2025-08-14T20:42:33.5673342Z   NODE_VERSION: 20
2025-08-14T20:42:33.5673550Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:33.5673796Z ##[endgroup]
2025-08-14T20:42:33.5737111Z 🚀 Triggering VPS deployment...
2025-08-14T20:42:33.5883486Z   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
2025-08-14T20:42:33.5884248Z                                  Dload  Upload   Total   Spent    Left  Speed
2025-08-14T20:42:33.5884490Z 
2025-08-14T20:42:33.6470869Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
2025-08-14T20:42:33.6472194Z 100   682  100   102  100   580   1736   9873 --:--:-- --:--:-- --:--:-- 11758
2025-08-14T20:42:33.6487497Z ❌ VPS deployment webhook failed with status: 401
2025-08-14T20:42:33.6497743Z Response: {"message":"Invalid signature","status":"error","type":"error","timestamp":"2025-08-14T20:42:33.628Z"}
2025-08-14T20:42:33.6516268Z ##[error]Process completed with exit code 1.
2025-08-14T20:42:33.6590669Z ##[group]Run if [ "failure" = "success" ]; then
2025-08-14T20:42:33.6591273Z [36;1mif [ "failure" = "success" ]; then[0m
2025-08-14T20:42:33.6591845Z [36;1m  echo "✅ WORKFLOW COMPLETED SUCCESSFULLY"[0m
2025-08-14T20:42:33.6592548Z [36;1m  echo "🚀 VPS deployment will be triggered automatically via webhook"[0m
2025-08-14T20:42:33.6593172Z [36;1melse[0m
2025-08-14T20:42:33.6593516Z [36;1m  echo "❌ WORKFLOW FAILED"[0m
2025-08-14T20:42:33.6594019Z [36;1m  echo "🛑 No deployment will be triggered"[0m
2025-08-14T20:42:33.6594484Z [36;1mfi[0m
2025-08-14T20:42:33.6594783Z [36;1m[0m
2025-08-14T20:42:33.6595070Z [36;1mecho ""[0m
2025-08-14T20:42:33.6595445Z [36;1mecho "📋 Final Status: failure"[0m
2025-08-14T20:42:33.6596022Z [36;1mecho "🕐 Completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"[0m
2025-08-14T20:42:33.6652223Z shell: /usr/bin/bash -e {0}
2025-08-14T20:42:33.6652522Z env:
2025-08-14T20:42:33.6652746Z   NODE_VERSION: 20
2025-08-14T20:42:33.6653060Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T20:42:33.6653363Z ##[endgroup]
2025-08-14T20:42:33.6722570Z ❌ WORKFLOW FAILED
2025-08-14T20:42:33.6724318Z 🛑 No deployment will be triggered
2025-08-14T20:42:33.6725630Z 
2025-08-14T20:42:33.6725954Z 📋 Final Status: failure
2025-08-14T20:42:33.6735355Z 🕐 Completed at: 2025-08-14T20:42:33Z
2025-08-14T20:42:33.6859104Z Post job cleanup.
2025-08-14T20:42:33.7822177Z [command]/usr/bin/git version
2025-08-14T20:42:33.7862813Z git version 2.50.1
2025-08-14T20:42:33.7907421Z Temporarily overriding HOME='/home/runner/work/_temp/5ee4815a-5b1b-404d-b377-722f91485fdc' before making global git config changes
2025-08-14T20:42:33.7908939Z Adding repository directory to the temporary git global config as a safe directory
2025-08-14T20:42:33.7914358Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T20:42:33.7953305Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-08-14T20:42:33.7987908Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-08-14T20:42:33.8237273Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-08-14T20:42:33.8261637Z http.https://github.com/.extraheader
2025-08-14T20:42:33.8274598Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2025-08-14T20:42:33.8307471Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-08-14T20:42:33.8703271Z Cleaning up orphan processes
2025-08-14T20:42:33.9091683Z Terminate orphan process: pid (2218) (sh)
2025-08-14T20:42:33.9116645Z Terminate orphan process: pid (2219) (node (vitest))
2025-08-14T20:42:33.9154056Z Terminate orphan process: pid (2242) (esbuild)
