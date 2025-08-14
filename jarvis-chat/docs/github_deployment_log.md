2025-08-14T21:00:24.1925874Z Current runner version: '2.327.1'
2025-08-14T21:00:24.1958538Z ##[group]Runner Image Provisioner
2025-08-14T21:00:24.1959710Z Hosted Compute Agent
2025-08-14T21:00:24.1960702Z Version: 20250812.370
2025-08-14T21:00:24.1961700Z Commit: 4a2b2bf7520004e3e907c2150c8cabe342a3da32
2025-08-14T21:00:24.1962908Z Build Date: 2025-08-12T16:08:14Z
2025-08-14T21:00:24.1963902Z ##[endgroup]
2025-08-14T21:00:24.1964841Z ##[group]Operating System
2025-08-14T21:00:24.1965794Z Ubuntu
2025-08-14T21:00:24.1966564Z 24.04.2
2025-08-14T21:00:24.1967536Z LTS
2025-08-14T21:00:24.1968855Z ##[endgroup]
2025-08-14T21:00:24.1969703Z ##[group]Runner Image
2025-08-14T21:00:24.1970589Z Image: ubuntu-24.04
2025-08-14T21:00:24.1971544Z Version: 20250804.2.0
2025-08-14T21:00:24.1973261Z Included Software: https://github.com/actions/runner-images/blob/ubuntu24/20250804.2/images/ubuntu/Ubuntu2404-Readme.md
2025-08-14T21:00:24.1976003Z Image Release: https://github.com/actions/runner-images/releases/tag/ubuntu24%2F20250804.2
2025-08-14T21:00:24.1977987Z ##[endgroup]
2025-08-14T21:00:24.1980005Z ##[group]GITHUB_TOKEN Permissions
2025-08-14T21:00:24.1982824Z Contents: read
2025-08-14T21:00:24.1983808Z Metadata: read
2025-08-14T21:00:24.1984671Z Packages: read
2025-08-14T21:00:24.1985493Z ##[endgroup]
2025-08-14T21:00:24.1988985Z Secret source: Actions
2025-08-14T21:00:24.1990308Z Prepare workflow directory
2025-08-14T21:00:24.2530570Z Prepare all required actions
2025-08-14T21:00:24.2586295Z Getting action download info
2025-08-14T21:00:24.5599004Z Download action repository 'actions/checkout@v4' (SHA:08eba0b27e820071cde6df949e0beb9ba4906955)
2025-08-14T21:00:24.8456325Z Download action repository 'actions/setup-node@v4' (SHA:49933ea5288caeca8642d1e84afbd3f7d6820020)
2025-08-14T21:00:25.0732745Z Complete job name: build-and-deploy
2025-08-14T21:00:25.1426086Z ##[group]Run actions/checkout@v4
2025-08-14T21:00:25.1427131Z with:
2025-08-14T21:00:25.1427526Z   fetch-depth: 0
2025-08-14T21:00:25.1427976Z   repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:25.1428736Z   token: ***
2025-08-14T21:00:25.1429133Z   ssh-strict: true
2025-08-14T21:00:25.1429526Z   ssh-user: git
2025-08-14T21:00:25.1429938Z   persist-credentials: true
2025-08-14T21:00:25.1430398Z   clean: true
2025-08-14T21:00:25.1430803Z   sparse-checkout-cone-mode: true
2025-08-14T21:00:25.1431290Z   fetch-tags: false
2025-08-14T21:00:25.1431698Z   show-progress: true
2025-08-14T21:00:25.1432101Z   lfs: false
2025-08-14T21:00:25.1432473Z   submodules: false
2025-08-14T21:00:25.1432881Z   set-safe-directory: true
2025-08-14T21:00:25.1433565Z env:
2025-08-14T21:00:25.1433936Z   NODE_VERSION: 20
2025-08-14T21:00:25.1434370Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:25.1434839Z ##[endgroup]
2025-08-14T21:00:25.2679802Z Syncing repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:25.2682592Z ##[group]Getting Git version info
2025-08-14T21:00:25.2683969Z Working directory is '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT'
2025-08-14T21:00:25.2685889Z [command]/usr/bin/git version
2025-08-14T21:00:25.2745249Z git version 2.50.1
2025-08-14T21:00:25.2772564Z ##[endgroup]
2025-08-14T21:00:25.2795824Z Temporarily overriding HOME='/home/runner/work/_temp/b296ced3-17e3-422a-a260-adbecbada652' before making global git config changes
2025-08-14T21:00:25.2797800Z Adding repository directory to the temporary git global config as a safe directory
2025-08-14T21:00:25.2803492Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:25.2848700Z Deleting the contents of '/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT'
2025-08-14T21:00:25.2852248Z ##[group]Initializing the repository
2025-08-14T21:00:25.2858700Z [command]/usr/bin/git init /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:25.2940389Z hint: Using 'master' as the name for the initial branch. This default branch name
2025-08-14T21:00:25.2941800Z hint: is subject to change. To configure the initial branch name to use in all
2025-08-14T21:00:25.2943540Z hint: of your new repositories, which will suppress this warning, call:
2025-08-14T21:00:25.2944300Z hint:
2025-08-14T21:00:25.2944947Z hint: 	git config --global init.defaultBranch <name>
2025-08-14T21:00:25.2946001Z hint:
2025-08-14T21:00:25.2947196Z hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
2025-08-14T21:00:25.2948871Z hint: 'development'. The just-created branch can be renamed via this command:
2025-08-14T21:00:25.2950175Z hint:
2025-08-14T21:00:25.2950923Z hint: 	git branch -m <name>
2025-08-14T21:00:25.2951708Z hint:
2025-08-14T21:00:25.2952727Z hint: Disable this message with "git config set advice.defaultBranchName false"
2025-08-14T21:00:25.2954730Z Initialized empty Git repository in /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/.git/
2025-08-14T21:00:25.2958101Z [command]/usr/bin/git remote add origin https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:25.2994041Z ##[endgroup]
2025-08-14T21:00:25.2995243Z ##[group]Disabling automatic garbage collection
2025-08-14T21:00:25.2999158Z [command]/usr/bin/git config --local gc.auto 0
2025-08-14T21:00:25.3027622Z ##[endgroup]
2025-08-14T21:00:25.3028857Z ##[group]Setting up auth
2025-08-14T21:00:25.3035044Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-08-14T21:00:25.3065043Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-08-14T21:00:25.3377776Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-08-14T21:00:25.3407874Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-08-14T21:00:25.3624767Z [command]/usr/bin/git config --local http.https://github.com/.extraheader AUTHORIZATION: basic ***
2025-08-14T21:00:25.3659317Z ##[endgroup]
2025-08-14T21:00:25.3660067Z ##[group]Fetching the repository
2025-08-14T21:00:25.3668101Z [command]/usr/bin/git -c protocol.version=2 fetch --prune --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*
2025-08-14T21:00:26.0133577Z From https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:26.0137671Z  * [new branch]      codex/update-pwastatus-test-for-badge -> origin/codex/update-pwastatus-test-for-badge
2025-08-14T21:00:26.0140097Z  * [new branch]      main       -> origin/main
2025-08-14T21:00:26.0171646Z [command]/usr/bin/git branch --list --remote origin/main
2025-08-14T21:00:26.0195879Z   origin/main
2025-08-14T21:00:26.0205710Z [command]/usr/bin/git rev-parse refs/remotes/origin/main
2025-08-14T21:00:26.0227312Z beb740c17231648b9a1f06da4a0fbfbd7c47bcc7
2025-08-14T21:00:26.0234524Z ##[endgroup]
2025-08-14T21:00:26.0236018Z ##[group]Determining the checkout info
2025-08-14T21:00:26.0237812Z ##[endgroup]
2025-08-14T21:00:26.0241381Z [command]/usr/bin/git sparse-checkout disable
2025-08-14T21:00:26.0282670Z [command]/usr/bin/git config --local --unset-all extensions.worktreeConfig
2025-08-14T21:00:26.0309804Z ##[group]Checking out the ref
2025-08-14T21:00:26.0314440Z [command]/usr/bin/git checkout --progress --force -B main refs/remotes/origin/main
2025-08-14T21:00:26.1005506Z Switched to a new branch 'main'
2025-08-14T21:00:26.1007473Z branch 'main' set up to track 'origin/main'.
2025-08-14T21:00:26.1020482Z ##[endgroup]
2025-08-14T21:00:26.1059066Z [command]/usr/bin/git log -1 --format=%H
2025-08-14T21:00:26.1080921Z beb740c17231648b9a1f06da4a0fbfbd7c47bcc7
2025-08-14T21:00:26.1366860Z ##[group]Run actions/setup-node@v4
2025-08-14T21:00:26.1368171Z with:
2025-08-14T21:00:26.1368986Z   node-version: 20
2025-08-14T21:00:26.1369873Z   cache: npm
2025-08-14T21:00:26.1370944Z   cache-dependency-path: jarvis-chat/package-lock.json
2025-08-14T21:00:26.1372227Z   always-auth: false
2025-08-14T21:00:26.1373364Z   check-latest: false
2025-08-14T21:00:26.1374557Z   token: ***
2025-08-14T21:00:26.1375392Z env:
2025-08-14T21:00:26.1376181Z   NODE_VERSION: 20
2025-08-14T21:00:26.1377239Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:26.1378295Z ##[endgroup]
2025-08-14T21:00:26.3555053Z Found in cache @ /opt/hostedtoolcache/node/20.19.4/x64
2025-08-14T21:00:26.3561929Z ##[group]Environment details
2025-08-14T21:00:28.8779795Z node: v20.19.4
2025-08-14T21:00:28.8780959Z npm: 10.8.2
2025-08-14T21:00:28.8781384Z yarn: 1.22.22
2025-08-14T21:00:28.8782550Z ##[endgroup]
2025-08-14T21:00:28.8802707Z [command]/opt/hostedtoolcache/node/20.19.4/x64/bin/npm config get cache
2025-08-14T21:00:29.1912406Z /home/runner/.npm
2025-08-14T21:00:29.2772631Z Cache hit for: node-cache-Linux-x64-npm-9a18259fac7913a495886720380a5439d83a5add66f3f6dd036d2fed991eeaa3
2025-08-14T21:00:29.7454194Z Received 84798540 of 84798540 (100.0%), 185.9 MBs/sec
2025-08-14T21:00:29.7456352Z Cache Size: ~81 MB (84798540 B)
2025-08-14T21:00:29.7512405Z [command]/usr/bin/tar -xf /home/runner/work/_temp/d3b79c67-34ee-418c-8053-633a1f85bd93/cache.tzst -P -C /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT --use-compress-program unzstd
2025-08-14T21:00:30.1235170Z Cache restored successfully
2025-08-14T21:00:30.1417882Z Cache restored from key: node-cache-Linux-x64-npm-9a18259fac7913a495886720380a5439d83a5add66f3f6dd036d2fed991eeaa3
2025-08-14T21:00:30.1592770Z ##[group]Run echo "🔍 Build Environment Information:"
2025-08-14T21:00:30.1593244Z [36;1mecho "🔍 Build Environment Information:"[0m
2025-08-14T21:00:30.1593602Z [36;1mecho "Node.js version: $(node --version)"[0m
2025-08-14T21:00:30.1593946Z [36;1mecho "NPM version: $(npm --version)"[0m
2025-08-14T21:00:30.1594271Z [36;1mecho "Working directory: jarvis-chat"[0m
2025-08-14T21:00:30.1594544Z [36;1mecho "Branch: main"[0m
2025-08-14T21:00:30.1594855Z [36;1mecho "Commit SHA: beb740c17231648b9a1f06da4a0fbfbd7c47bcc7"[0m
2025-08-14T21:00:30.1595247Z [36;1mecho "Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT"[0m
2025-08-14T21:00:30.1595605Z [36;1mecho "Workflow: Deploy to VPS"[0m
2025-08-14T21:00:30.1595868Z [36;1mecho "Run ID: 16976574215"[0m
2025-08-14T21:00:30.1675644Z shell: /usr/bin/bash -e {0}
2025-08-14T21:00:30.1675928Z env:
2025-08-14T21:00:30.1676119Z   NODE_VERSION: 20
2025-08-14T21:00:30.1676347Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:30.1676648Z ##[endgroup]
2025-08-14T21:00:30.1825463Z 🔍 Build Environment Information:
2025-08-14T21:00:30.1825850Z Node.js version: v20.19.4
2025-08-14T21:00:30.2661813Z NPM version: 10.8.2
2025-08-14T21:00:30.2662409Z Working directory: jarvis-chat
2025-08-14T21:00:30.2662838Z Branch: main
2025-08-14T21:00:30.2663387Z Commit SHA: beb740c17231648b9a1f06da4a0fbfbd7c47bcc7
2025-08-14T21:00:30.2664094Z Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:00:30.2664637Z Workflow: Deploy to VPS
2025-08-14T21:00:30.2665045Z Run ID: 16976574215
2025-08-14T21:00:30.2698718Z ##[group]Run echo "📦 Installing dependencies with npm ci..."
2025-08-14T21:00:30.2699211Z [36;1mecho "📦 Installing dependencies with npm ci..."[0m
2025-08-14T21:00:30.2699516Z [36;1m[0m
2025-08-14T21:00:30.2699736Z [36;1m# Clean install to fix lockfile issues[0m
2025-08-14T21:00:30.2700050Z [36;1mif [ -f "package-lock.json" ]; then[0m
2025-08-14T21:00:30.2700369Z [36;1m  echo "🔄 Using existing package-lock.json"[0m
2025-08-14T21:00:30.2700726Z [36;1m  npm ci --production=false --no-audit --prefer-offline[0m
2025-08-14T21:00:30.2701059Z [36;1melse[0m
2025-08-14T21:00:30.2701332Z [36;1m  echo "⚠️ No package-lock.json found, generating new one"[0m
2025-08-14T21:00:30.2701686Z [36;1m  npm install --production=false --no-audit[0m
2025-08-14T21:00:30.2701961Z [36;1mfi[0m
2025-08-14T21:00:30.2702132Z [36;1m[0m
2025-08-14T21:00:30.2702348Z [36;1mecho "✅ Dependencies installed successfully"[0m
2025-08-14T21:00:30.2744946Z shell: /usr/bin/bash -e {0}
2025-08-14T21:00:30.2745240Z env:
2025-08-14T21:00:30.2745425Z   NODE_VERSION: 20
2025-08-14T21:00:30.2745870Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:30.2746121Z ##[endgroup]
2025-08-14T21:00:30.2807666Z 📦 Installing dependencies with npm ci...
2025-08-14T21:00:30.2808134Z 🔄 Using existing package-lock.json
2025-08-14T21:00:30.3622895Z npm warn config production Use `--omit=dev` instead.
2025-08-14T21:00:32.2071363Z npm warn reify invalid or damaged lockfile detected
2025-08-14T21:00:32.2072274Z npm warn reify please re-try this operation once it completes
2025-08-14T21:00:32.2073163Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T21:00:32.2074084Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T21:00:32.2084046Z npm warn reify invalid or damaged lockfile detected
2025-08-14T21:00:32.2085910Z npm warn reify please re-try this operation once it completes
2025-08-14T21:00:32.2087233Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T21:00:32.2088299Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T21:00:32.2089292Z npm warn reify invalid or damaged lockfile detected
2025-08-14T21:00:32.2091564Z npm warn reify please re-try this operation once it completes
2025-08-14T21:00:32.2092486Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T21:00:32.2093426Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T21:00:32.2094765Z npm warn reify invalid or damaged lockfile detected
2025-08-14T21:00:32.2095666Z npm warn reify please re-try this operation once it completes
2025-08-14T21:00:32.2096526Z npm warn reify so that the damage can be corrected, or perform
2025-08-14T21:00:32.2097596Z npm warn reify a fresh install with no lockfile if the problem persists.
2025-08-14T21:00:32.9734764Z npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
2025-08-14T21:00:41.0893624Z 
2025-08-14T21:00:41.0894471Z > jarvis-chat@0.0.0 prepare
2025-08-14T21:00:41.0895780Z > is-ci || husky
2025-08-14T21:00:41.0896016Z 
2025-08-14T21:00:41.1347303Z 
2025-08-14T21:00:41.1348007Z added 602 packages in 11s
2025-08-14T21:00:41.1348333Z 
2025-08-14T21:00:41.1348627Z 121 packages are looking for funding
2025-08-14T21:00:41.1349133Z   run `npm fund` for details
2025-08-14T21:00:41.1934868Z ✅ Dependencies installed successfully
2025-08-14T21:00:41.1964095Z ##[group]Run echo "🔍 Validating project configuration..."
2025-08-14T21:00:41.1964540Z [36;1mecho "🔍 Validating project configuration..."[0m
2025-08-14T21:00:41.1964823Z [36;1m[0m
2025-08-14T21:00:41.1965074Z [36;1m# Check package.json exists and has required scripts[0m
2025-08-14T21:00:41.1965413Z [36;1mif [ ! -f "package.json" ]; then[0m
2025-08-14T21:00:41.1965696Z [36;1m  echo "❌ package.json not found"[0m
2025-08-14T21:00:41.1965950Z [36;1m  exit 1[0m
2025-08-14T21:00:41.1966132Z [36;1mfi[0m
2025-08-14T21:00:41.1966300Z [36;1m[0m
2025-08-14T21:00:41.1966478Z [36;1m# Verify required scripts exist[0m
2025-08-14T21:00:41.1966827Z [36;1mif ! npm run --silent 2>/dev/null | grep -q "test\|build\|lint"; then[0m
2025-08-14T21:00:41.1967614Z [36;1m  echo "⚠️ Some required scripts may be missing"[0m
2025-08-14T21:00:41.1967891Z [36;1mfi[0m
2025-08-14T21:00:41.1968060Z [36;1m[0m
2025-08-14T21:00:41.1968239Z [36;1m# Check critical files exist[0m
2025-08-14T21:00:41.1968544Z [36;1mif [ ! -f "vite.config.ts" ]; then[0m
2025-08-14T21:00:41.1968856Z [36;1m  echo "⚠️ vite.config.ts not found - build may fail"[0m
2025-08-14T21:00:41.1969138Z [36;1mfi[0m
2025-08-14T21:00:41.1969294Z [36;1m[0m
2025-08-14T21:00:41.1969480Z [36;1mif [ ! -f "tsconfig.json" ]; then[0m
2025-08-14T21:00:41.1969825Z [36;1m  echo "⚠️ tsconfig.json not found - TypeScript compilation may fail"[0m
2025-08-14T21:00:41.1970153Z [36;1mfi[0m
2025-08-14T21:00:41.1970314Z [36;1m[0m
2025-08-14T21:00:41.1970522Z [36;1mecho "✅ Environment validation completed"[0m
2025-08-14T21:00:41.2013023Z shell: /usr/bin/bash -e {0}
2025-08-14T21:00:41.2013256Z env:
2025-08-14T21:00:41.2013607Z   NODE_VERSION: 20
2025-08-14T21:00:41.2013815Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:41.2014050Z ##[endgroup]
2025-08-14T21:00:41.2079200Z 🔍 Validating project configuration...
2025-08-14T21:00:41.3256676Z ⚠️ Some required scripts may be missing
2025-08-14T21:00:41.3257484Z ✅ Environment validation completed
2025-08-14T21:00:41.3285354Z ##[group]Run echo "🧪 Running test suite..."
2025-08-14T21:00:41.3285708Z [36;1mecho "🧪 Running test suite..."[0m
2025-08-14T21:00:41.3285960Z [36;1m[0m
2025-08-14T21:00:41.3286187Z [36;1m# Set Node.js memory limit to prevent OOM errors[0m
2025-08-14T21:00:41.3286534Z [36;1mexport NODE_OPTIONS="--max-old-space-size=4096"[0m
2025-08-14T21:00:41.3286820Z [36;1m[0m
2025-08-14T21:00:41.3287344Z [36;1m# Run tests with proper error handling and memory optimization[0m
2025-08-14T21:00:41.3287703Z [36;1mif npm run test:ci; then[0m
2025-08-14T21:00:41.3287999Z [36;1m  echo "✅ All tests passed successfully"[0m
2025-08-14T21:00:41.3288419Z [36;1melse[0m
2025-08-14T21:00:41.3288614Z [36;1m  echo "❌ Tests failed"[0m
2025-08-14T21:00:41.3288839Z [36;1m  [0m
2025-08-14T21:00:41.3289036Z [36;1m  # Check if force deploy is enabled[0m
2025-08-14T21:00:41.3289295Z [36;1m  if [ "" = "true" ]; then[0m
2025-08-14T21:00:41.3289674Z [36;1m    echo "⚠️ Force deploy enabled - continuing despite test failures"[0m
2025-08-14T21:00:41.3290005Z [36;1m  else[0m
2025-08-14T21:00:41.3290240Z [36;1m    echo "🛑 Deployment cancelled due to test failures"[0m
2025-08-14T21:00:41.3290639Z [36;1m    exit 1[0m
2025-08-14T21:00:41.3290943Z [36;1m  fi[0m
2025-08-14T21:00:41.3291217Z [36;1mfi[0m
2025-08-14T21:00:41.3345443Z shell: /usr/bin/bash -e {0}
2025-08-14T21:00:41.3345811Z env:
2025-08-14T21:00:41.3346095Z   NODE_VERSION: 20
2025-08-14T21:00:41.3346453Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:00:41.3346857Z ##[endgroup]
2025-08-14T21:00:41.3421206Z 🧪 Running test suite...
2025-08-14T21:00:41.4735411Z 
2025-08-14T21:00:41.4735967Z > jarvis-chat@0.0.0 test:ci
2025-08-14T21:00:41.4736720Z > node scripts/force-exit-after-tests.cjs
2025-08-14T21:00:41.4737334Z 
2025-08-14T21:00:41.5091094Z 🚀 Force Exit Test Runner: Will exit immediately after test completion
2025-08-14T21:00:42.3192150Z 
2025-08-14T21:00:42.3195197Z [1m[46m RUN [49m[22m [36mv3.2.4 [39m[90m/home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat[39m
2025-08-14T21:00:42.3195924Z 
2025-08-14T21:00:43.4777379Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mComplete Bug Lifecycle Workflow[2m > [22mprocesses complete bug lifecycle from open to closed[32m 9[2mms[22m[39m
2025-08-14T21:00:43.4780945Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mComplete Bug Lifecycle Workflow[2m > [22mhandles escalation workflow correctly[32m 2[2mms[22m[39m
2025-08-14T21:00:43.4783899Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mNotification Integration[2m > [22msends notifications throughout bug lifecycle[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4787122Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mNotification Integration[2m > [22mrespects user notification preferences[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4790134Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mCommunication and Collaboration[2m > [22mhandles threaded discussions correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4793145Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mCommunication and Collaboration[2m > [22mtracks audit trail for all activities[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4795882Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mFeedback Integration[2m > [22mprocesses feedback lifecycle correctly[32m 2[2mms[22m[39m
2025-08-14T21:00:43.4798307Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mPerformance and Scalability[2m > [22mhandles concurrent operations efficiently[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4799840Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mPerformance and Scalability[2m > [22mmaintains data consistency under load[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4801272Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mError Handling and Recovery[2m > [22mhandles service failures gracefully[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4802704Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mError Handling and Recovery[2m > [22mvalidates state transitions correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4804179Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mIntegration with Monitoring[2m > [22mtracks all lifecycle events for monitoring[32m 3[2mms[22m[39m
2025-08-14T21:00:43.4805707Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mWorkflow Optimization[2m > [22moptimizes assignment recommendations based on workload[32m 1[2mms[22m[39m
2025-08-14T21:00:43.4807489Z  [32m✓[39m src/lib/__tests__/bugLifecycleIntegration.test.ts[2m > [22mBug Lifecycle Integration Tests[2m > [22mWorkflow Optimization[2m > [22mprovides workload balancing recommendations[32m 1[2mms[22m[39m
2025-08-14T21:00:44.2868587Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 3)
2025-08-14T21:00:44.2869955Z (Use `node --trace-warnings ...` to show where the warning was created)
2025-08-14T21:00:44.2955866Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 10)
2025-08-14T21:00:44.2976341Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 14)
2025-08-14T21:00:44.3024473Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 18)
2025-08-14T21:00:44.3037105Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 22)
2025-08-14T21:00:44.3057813Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 27)
2025-08-14T21:00:44.3065928Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 31)
2025-08-14T21:00:44.3197438Z (node:2256) PromiseRejectionHandledWarning: Promise rejection was handled asynchronously (rejection id: 33)
2025-08-14T21:00:44.3423553Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould send message successfully with valid payload[32m 9[2mms[22m[39m
2025-08-14T21:00:44.3426744Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould include request metadata in payload[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3430152Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mMessage Sending Success Scenarios[2m > [22mshould handle response with additional fields[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3433178Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould throw validation error for missing webhook URL[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3435603Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle HTTP error responses[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3438481Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle network errors[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3440092Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle timeout errors[32m 3[2mms[22m[39m
2025-08-14T21:00:44.3441478Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle malformed response format[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3442714Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mError Handling[2m > [22mshould handle webhook response with success: false[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3444110Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould retry on retryable errors with fake timer advancement[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3445524Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould not retry on non-retryable errors[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3446809Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould respect max attempts[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3448510Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould calculate exponential backoff delays[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3449925Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould not retry on 4xx client errors (except 408, 429)[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3451320Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mRetry Logic with Exponential Backoff[2m > [22mshould retry on retryable HTTP status codes[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3452736Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould open circuit after failure threshold with fake timers[32m 3[2mms[22m[39m
2025-08-14T21:00:44.3454074Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould reset circuit breaker on successful request[32m 6[2mms[22m[39m
2025-08-14T21:00:44.3455396Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould provide circuit breaker configuration methods[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3456699Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mCircuit Breaker Pattern[2m > [22mshould allow manual circuit breaker reset[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3458191Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould validate required payload fields[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3459526Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould include optional payload fields when provided[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3460919Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mWebhook Payload Validation[2m > [22mshould validate webhook response format strictly[32m 3[2mms[22m[39m
2025-08-14T21:00:44.3462171Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould track request metrics[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3463536Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould track error metrics on failures[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3464899Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould calculate percentile response times[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3466182Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mPerformance and Metrics[2m > [22mshould include last request timestamp in metrics[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3467530Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mHealth Check[2m > [22mshould perform health check successfully[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3468703Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mHealth Check[2m > [22mshould return unhealthy status on errors[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3469950Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mConcurrent Request Handling[2m > [22mshould handle multiple concurrent requests[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3471310Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mConcurrent Request Handling[2m > [22mshould handle mixed success/failure in concurrent requests[32m 2[2mms[22m[39m
2025-08-14T21:00:44.3472743Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould include authorization header when secret is provided[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3474109Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould include standard headers in all requests[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3475385Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mAuthentication and Security[2m > [22mshould generate unique request IDs[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3476723Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mTimer Management and Cleanup[2m > [22mshould not have pending timers after operation completion[32m 1[2mms[22m[39m
2025-08-14T21:00:44.3478135Z  [32m✓[39m src/lib/__tests__/webhookService.test.ts[2m > [22mWebhookService[2m > [22mTimer Management and Cleanup[2m > [22mshould clean up resources on destroy[32m 1[2mms[22m[39m
2025-08-14T21:00:45.5434092Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould create webhook configuration with admin permissions[32m 26[2mms[22m[39m
2025-08-14T21:00:45.5438157Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould return 401 for missing admin permissions[32m 9[2mms[22m[39m
2025-08-14T21:00:45.5447419Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould validate webhook configuration[32m 11[2mms[22m[39m
2025-08-14T21:00:45.5449144Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould support different authentication types[32m 11[2mms[22m[39m
2025-08-14T21:00:45.5451437Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/webhooks[2m > [22mshould support event filtering[32m 3[2mms[22m[39m
2025-08-14T21:00:45.5453034Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform pattern analysis[32m 3[2mms[22m[39m
2025-08-14T21:00:45.5455429Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform resolution analysis[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5458480Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform severity classification[32m 3[2mms[22m[39m
2025-08-14T21:00:45.5461256Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform duplicate detection[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5463981Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould perform user impact analysis[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5466809Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould return 400 for invalid analysis type[32m 3[2mms[22m[39m
2025-08-14T21:00:45.5469874Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould return 404 for non-existent bug[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5472567Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/claude-code/analyze/:bugId[2m > [22mshould support analysis context options[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5475407Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould setup Sentry integration with admin permissions[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5478331Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould return 401 for missing admin permissions[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5480946Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould validate Sentry configuration[32m 4[2mms[22m[39m
2025-08-14T21:00:45.5483557Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/sentry[2m > [22mshould handle connection test failures[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5486159Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould setup DataDog integration with admin permissions[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5488997Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould return 401 for missing admin permissions[32m 2[2mms[22m[39m
2025-08-14T21:00:45.5491606Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould validate DataDog configuration[32m 4[2mms[22m[39m
2025-08-14T21:00:45.6016294Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mPOST /api/integrations/datadog[2m > [22mshould support different DataDog sites[32m 11[2mms[22m[39m
2025-08-14T21:00:45.6020517Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations/:id/status[2m > [22mshould return integration status[32m 7[2mms[22m[39m
2025-08-14T21:00:45.6023326Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations/:id/status[2m > [22mshould return 404 for non-existent integration[32m 4[2mms[22m[39m
2025-08-14T21:00:45.6025285Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mGET /api/integrations[2m > [22mshould list all integrations with summary[32m 10[2mms[22m[39m
2025-08-14T21:00:45.6027108Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for Sentry correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:45.6028747Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for DataDog correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:45.6030378Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould format bug data for Slack correctly[32m 15[2mms[22m[39m
2025-08-14T21:00:45.6031930Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mWebhook Delivery Service[2m > [22mshould get delivery statistics[32m 1[2mms[22m[39m
2025-08-14T21:00:45.6034834Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mError Handling[2m > [22mshould handle malformed webhook configurations[32m 3[2mms[22m[39m
2025-08-14T21:00:45.6037822Z  [32m✓[39m src/services/__tests__/externalIntegration.test.ts[2m > [22mExternal Integration Service[2m > [22mError Handling[2m > [22mshould handle service unavailability gracefully[32m 2[2mms[22m[39m
2025-08-14T21:00:46.6010823Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould create export request with export permissions[32m 30[2mms[22m[39m
2025-08-14T21:00:46.6014311Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould return 401 for missing export permissions[32m 5[2mms[22m[39m
2025-08-14T21:00:46.6016845Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould validate export format[32m 4[2mms[22m[39m
2025-08-14T21:00:46.6019706Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould support all valid export formats[32m 15[2mms[22m[39m
2025-08-14T21:00:46.6023573Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould apply export templates[32m 3[2mms[22m[39m
2025-08-14T21:00:46.6025076Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports[2m > [22mshould return 503 when export queue is full[32m 13[2mms[22m[39m
2025-08-14T21:00:46.6026572Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould return export status for valid export ID[32m 6[2mms[22m[39m
2025-08-14T21:00:46.6028232Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould return 404 for non-existent export ID[32m 3[2mms[22m[39m
2025-08-14T21:00:46.7869116Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id[2m > [22mshould include progress for processing exports[32m 107[2mms[22m[39m
2025-08-14T21:00:47.2955216Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id/download[2m > [22mshould download completed export file[33m 508[2mms[22m[39m
2025-08-14T21:00:47.2958188Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/:id/download[2m > [22mshould return 400 for incomplete export[32m 4[2mms[22m[39m
2025-08-14T21:00:47.2960138Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould create scheduled export with admin permissions[32m 3[2mms[22m[39m
2025-08-14T21:00:47.2961984Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould return 401 for missing admin permissions[32m 6[2mms[22m[39m
2025-08-14T21:00:47.2963800Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould validate schedule configuration[32m 4[2mms[22m[39m
2025-08-14T21:00:47.2965660Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mPOST /api/exports/scheduled[2m > [22mshould support different schedule frequencies[32m 9[2mms[22m[39m
2025-08-14T21:00:47.2967448Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/templates[2m > [22mshould return available export templates[32m 7[2mms[22m[39m
2025-08-14T21:00:47.2968850Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mGET /api/exports/templates[2m > [22mshould filter templates by user access[32m 2[2mms[22m[39m
2025-08-14T21:00:47.2970176Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould handle large dataset exports[32m 18[2mms[22m[39m
2025-08-14T21:00:47.6618730Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould apply field selection correctly[32m 206[2mms[22m[39m
2025-08-14T21:00:47.6734172Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mExport Processing[2m > [22mshould handle export failures gracefully[32m 207[2mms[22m[39m
2025-08-14T21:00:47.6736529Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mCustom Processing Options[2m > [22mshould apply data anonymization when requested[32m 3[2mms[22m[39m
2025-08-14T21:00:47.6739130Z  [32m✓[39m src/api/__tests__/bugExport.test.ts[2m > [22mBug Export API[2m > [22mCustom Processing Options[2m > [22mshould flatten nested objects when requested[32m 3[2mms[22m[39m
2025-08-14T21:00:48.4447267Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate a basic valid payload[32m 4[2mms[22m[39m
2025-08-14T21:00:48.4450327Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate payload with all optional fields[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4453263Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with missing required fields[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4455129Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with invalid field types[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4456627Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould reject payload with extra unknown fields[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4458413Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate message length constraints[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4460563Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate all supported message types[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4461990Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate all supported tool IDs[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4463554Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Payload Schema Validation[2m > [22mshould validate UUID format strictly[32m 2[2mms[22m[39m
2025-08-14T21:00:48.4464986Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould validate enhanced payload with metadata[32m 2[2mms[22m[39m
2025-08-14T21:00:48.4466711Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould apply default values for optional metadata fields[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4468526Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mEnhanced Webhook Payload Schema Validation[2m > [22mshould validate tool selection metadata structure[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4469981Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate successful webhook response[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4471380Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate error webhook response[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4472788Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould reject response with invalid structure[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4474200Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhook Response Schema Validation[2m > [22mshould validate optional response fields[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4475590Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate healthy status response[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4477193Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate degraded status response[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4478635Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould reject invalid health status values[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4480071Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mHealth Check Response Schema Validation[2m > [22mshould validate minimal health check response[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4481502Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mValidation Error Schema[2m > [22mshould create properly structured validation errors[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4482976Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould create validated payload with createValidatedPayload[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4484452Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould throw error for invalid payload construction[32m 4[2mms[22m[39m
2025-08-14T21:00:48.4486375Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould provide validation summary[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4487993Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould provide detailed validation summary for invalid payload[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4489705Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mWebhookValidator Utility Methods[2m > [22mshould handle edge cases in validation summary[32m 1[2mms[22m[39m
2025-08-14T21:00:48.4491730Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mSchema Integration Tests[2m > [22mshould work with real-world payload example[32m 0[2mms[22m[39m
2025-08-14T21:00:48.4493601Z  [32m✓[39m src/lib/__tests__/webhookValidation.test.ts[2m > [22mWebhookValidation[2m > [22mSchema Integration Tests[2m > [22mshould handle complex validation error scenarios[32m 1[2mms[22m[39m
2025-08-14T21:00:49.4219793Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return paginated bugs with valid API key[32m 21[2mms[22m[39m
2025-08-14T21:00:49.4222706Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return 401 for invalid API key[32m 5[2mms[22m[39m
2025-08-14T21:00:49.4225370Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould return 401 for missing API key[32m 7[2mms[22m[39m
2025-08-14T21:00:49.4228035Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould apply status filters correctly[32m 5[2mms[22m[39m
2025-08-14T21:00:49.4229945Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould apply date range filters correctly[32m 4[2mms[22m[39m
2025-08-14T21:00:49.4231240Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs[2m > [22mshould enforce pagination limits[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4233385Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/:id[2m > [22mshould return bug details with valid ID[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4235566Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/:id[2m > [22mshould return 404 for non-existent bug[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4238173Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould update bug status with write permissions[32m 10[2mms[22m[39m
2025-08-14T21:00:49.4240585Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould return 400 for invalid status[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4242915Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPUT /api/bugs/:id/status[2m > [22mshould return 401 for insufficient permissions[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4244945Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/:id/assign[2m > [22mshould assign bug with write permissions[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4246211Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/:id/assign[2m > [22mshould return 400 for failed assignment[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4248870Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/search[2m > [22mshould perform text search with results[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4251140Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mPOST /api/bugs/search[2m > [22mshould return empty results for no matches[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4253150Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/analytics[2m > [22mshould return analytics data[32m 3[2mms[22m[39m
2025-08-14T21:00:49.4255328Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mGET /api/bugs/analytics[2m > [22mshould use default time range when not specified[32m 2[2mms[22m[39m
2025-08-14T21:00:49.4257414Z  [2m[90m↓[39m[22m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mRate Limiting[2m > [22mshould enforce rate limits
2025-08-14T21:00:49.4258497Z  [2m[90m↓[39m[22m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mError Handling[2m > [22mshould handle database errors gracefully
2025-08-14T21:00:49.4259650Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mError Handling[2m > [22mshould handle service errors gracefully[32m 8[2mms[22m[39m
2025-08-14T21:00:49.4260856Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate required fields for status updates[32m 2[2mms[22m[39m
2025-08-14T21:00:49.4262860Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate required fields for assignments[32m 2[2mms[22m[39m
2025-08-14T21:00:49.4279307Z  [32m✓[39m src/api/__tests__/bugDashboard.test.ts[2m > [22mBug Dashboard API[2m > [22mInput Validation[2m > [22mshould validate pagination parameters[32m 3[2mms[22m[39m
2025-08-14T21:00:50.1854394Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould record successful requests correctly[32m 3[2mms[22m[39m
2025-08-14T21:00:50.1857265Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould record failed requests correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1860109Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould calculate percentiles correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1862851Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould track requests per minute and hour[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1865555Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould determine health status based on metrics[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1868410Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould handle empty metrics gracefully[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1870346Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mPerformance Metrics Collection[2m > [22mshould maintain performance history size limit[32m 10[2mms[22m[39m
2025-08-14T21:00:50.1871771Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould initialize with default alert rules[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1873420Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould trigger high error rate alert[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1874835Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould trigger slow response time alert[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1876139Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould respect alert cooldown periods[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1877640Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould allow custom alert rules[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1878878Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould allow alert resolution[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1880137Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert System[2m > [22mshould generate descriptive alert messages[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1881476Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould generate comprehensive dashboard data[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1882833Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould include performance trends in dashboard data[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1884180Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mDashboard Data[2m > [22mshould limit recent alerts in dashboard data[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1885518Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould allow multiple subscribers[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1887047Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould handle subscriber errors gracefully[32m 2[2mms[22m[39m
2025-08-14T21:00:50.1888466Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mAlert Subscription Management[2m > [22mshould properly unsubscribe callbacks[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1889925Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould infer circuit breaker state from error patterns[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1891383Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould detect half-open circuit breaker state[32m 1[2mms[22m[39m
2025-08-14T21:00:50.1893104Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mCircuit Breaker Integration[2m > [22mshould show closed circuit breaker for healthy patterns[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1895619Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mData Cleanup and Management[2m > [22mshould clear history and alerts properly[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1898384Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mData Cleanup and Management[2m > [22mshould handle concurrent request recording safely[32m 5[2mms[22m[39m
2025-08-14T21:00:50.1901050Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mSingleton Instance[2m > [22mshould provide working singleton instance[32m 0[2mms[22m[39m
2025-08-14T21:00:50.1903964Z  [32m✓[39m src/lib/__tests__/webhookMonitoring.test.ts[2m > [22mWebhookMonitoringService[2m > [22mSingleton Instance[2m > [22mshould maintain state across singleton access[32m 0[2mms[22m[39m
2025-08-14T21:00:50.9772242Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mcompletes full bug report submission workflow[32m 6[2mms[22m[39m
2025-08-14T21:00:50.9774579Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mintegrates error tracking with bug reports[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9776687Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mintegrates performance monitoring[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9779013Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles validation errors properly[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9781185Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles file upload failures gracefully[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9783349Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mdetects and prevents duplicate submissions[32m 0[2mms[22m[39m
2025-08-14T21:00:50.9785556Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mprocesses submission queue correctly[32m 53[2mms[22m[39m
2025-08-14T21:00:50.9787912Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mmaintains data integrity throughout the process[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9790116Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mhandles system errors and recovers gracefully[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9792237Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mgenerates proper tracking numbers[32m 1[2mms[22m[39m
2025-08-14T21:00:50.9794306Z  [32m✓[39m src/__tests__/bugReportIntegration.test.ts[2m > [22mBug Report System Integration[2m > [22mmaintains performance under load[32m 15[2mms[22m[39m
2025-08-14T21:00:51.6954797Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22massigns bug to team member successfully[32m 5[2mms[22m[39m
2025-08-14T21:00:51.6961370Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles assignment to non-existent user[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6963579Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles database update failures[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6965201Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mtracks assignment history[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6966382Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mManual Assignment[2m > [22mhandles reassignment correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6967712Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mauto-assigns bug successfully[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6968942Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mreturns null when no suitable assignee found[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6970181Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAuto Assignment[2m > [22mconsiders workload when auto-assigning[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6971817Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22mgenerates assignment recommendations[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6973240Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22msorts recommendations by confidence[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6974572Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Recommendations[2m > [22mconsiders skill matching in recommendations[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6975902Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22mescalates bug priority successfully[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6977369Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22mprevents escalation beyond maximum priority[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6978662Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPriority Escalation[2m > [22msends escalation alerts to managers[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6979922Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mcalculates workload metrics correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6981160Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22midentifies workload imbalances[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6982372Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mupdates team member information[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6983636Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mWorkload Management[2m > [22mhandles update of non-existent team member[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6984870Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Rules[2m > [22mapplies assignment rules correctly[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6986135Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mAssignment Rules[2m > [22mfalls back to recommendations when no rules match[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6987472Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mError Handling[2m > [22mhandles bug fetch errors gracefully[32m 0[2mms[22m[39m
2025-08-14T21:00:51.6988683Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mError Handling[2m > [22mhandles notification failures gracefully[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6989952Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPerformance[2m > [22mhandles concurrent assignments without conflicts[32m 1[2mms[22m[39m
2025-08-14T21:00:51.6991284Z  [32m✓[39m src/lib/__tests__/assignmentSystem.test.ts[2m > [22mBugAssignmentSystem[2m > [22mPerformance[2m > [22mmaintains reasonable performance with large workload[32m 1[2mms[22m[39m
2025-08-14T21:00:52.3826303Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould validate application environment correctly
2025-08-14T21:00:52.3828418Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould reject invalid environment values
2025-08-14T21:00:52.3830379Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould warn about missing version in production
2025-08-14T21:00:52.3831991Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mApplication Configuration Validation[2m > [22mshould validate domain format
2025-08-14T21:00:52.3834359Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould require Supabase URL and key
2025-08-14T21:00:52.3837136Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould validate Supabase URL format
2025-08-14T21:00:52.3839855Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould warn about short Supabase keys
2025-08-14T21:00:52.3842589Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mDatabase Configuration Validation[2m > [22mshould warn about service role key security
2025-08-14T21:00:52.3845289Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould validate N8N webhook URL format
2025-08-14T21:00:52.3848178Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould require HTTPS for production webhooks
2025-08-14T21:00:52.3850999Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould warn about missing webhook secret
2025-08-14T21:00:52.3853770Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mExternal Integrations Validation[2m > [22mshould warn about weak webhook secrets
2025-08-14T21:00:52.3856429Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent debug tools in production
2025-08-14T21:00:52.3859413Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent mock responses in production
2025-08-14T21:00:52.3862191Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould prevent auth bypass outside development
2025-08-14T21:00:52.3864925Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mSecurity Configuration Validation[2m > [22mshould warn about missing CSP in production
2025-08-14T21:00:52.3867930Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate cache TTL values
2025-08-14T21:00:52.3870757Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate rate limiting configuration
2025-08-14T21:00:52.3873580Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mPerformance Configuration Validation[2m > [22mshould validate webhook performance settings
2025-08-14T21:00:52.3876667Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mProduction Readiness[2m > [22mshould identify production-ready configuration
2025-08-14T21:00:52.3879741Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mProduction Readiness[2m > [22mshould identify non-production-ready configuration
2025-08-14T21:00:52.3882423Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould return healthy status for valid configuration
2025-08-14T21:00:52.3884966Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould return error status for invalid configuration
2025-08-14T21:00:52.3887753Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mHealth Check Status[2m > [22mshould include metrics in health status
2025-08-14T21:00:52.3890137Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mEnvironment Info[2m > [22mshould return comprehensive environment information
2025-08-14T21:00:52.3891472Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mLogging[2m > [22mshould log environment status without errors
2025-08-14T21:00:52.3892818Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle development environment specifics
2025-08-14T21:00:52.3894231Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle staging environment specifics
2025-08-14T21:00:52.3895641Z  [2m[90m↓[39m[22m src/lib/__tests__/env-validation.enhanced.test.ts[2m > [22mEnhanced Environment Validation[2m > [22mCross-Environment Validation[2m > [22mshould handle production environment specifics
2025-08-14T21:00:53.1421948Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Development Environment[2m > [22mshould validate complete development setup[32m 4[2mms[22m[39m
2025-08-14T21:00:53.1425006Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Development Environment[2m > [22mshould allow insecure configurations in development[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1426705Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Staging Environment[2m > [22mshould validate complete staging setup[32m 2[2mms[22m[39m
2025-08-14T21:00:53.1428547Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Staging Environment[2m > [22mshould enforce HTTPS in staging[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1430070Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould validate complete production setup[32m 2[2mms[22m[39m
2025-08-14T21:00:53.1431654Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould reject insecure production configurations[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1433282Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete Production Environment[2m > [22mshould require HTTPS for all external services in production[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1436684Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mHealth Check Integration[2m > [22mshould provide comprehensive health status[32m 2[2mms[22m[39m
2025-08-14T21:00:53.1439564Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mHealth Check Integration[2m > [22mshould detect configuration problems in health checks[32m 2[2mms[22m[39m
2025-08-14T21:00:53.1442487Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mProduction Readiness Assessment[2m > [22mshould correctly assess production readiness[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1445573Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mProduction Readiness Assessment[2m > [22mshould reject non-production-ready configuration[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1448153Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mCross-System Dependencies[2m > [22mshould validate database and webhook integration[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1449724Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mCross-System Dependencies[2m > [22mshould validate monitoring integration[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1451206Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mError Correlation[2m > [22mshould correlate related errors across systems[32m 1[2mms[22m[39m
2025-08-14T21:00:53.1452663Z  [32m✓[39m src/lib/__tests__/environment-integration.test.ts[2m > [22mEnvironment & Secrets Integration[2m > [22mComplete System Validation[2m > [22mshould validate entire system health[32m 2[2mms[22m[39m
2025-08-14T21:00:53.8536240Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify strong secrets[32m 3[2mms[22m[39m
2025-08-14T21:00:53.8538312Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify medium strength secrets[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8540046Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify weak secrets[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8541885Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Strength Assessment[2m > [22mshould identify empty secrets as weak[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8543760Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require Supabase URL and key[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8545649Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require webhook secret in production[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8548495Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould require security secrets in production[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8550062Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRequired Secrets Validation[2m > [22mshould not require monitoring secrets in development[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8551482Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect weak security secrets as errors[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8553336Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould warn about client-exposed security secrets[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8554709Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould warn about service role key exposure[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8556047Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect default values in production[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8557653Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecurity Validation[2m > [22mshould detect development URLs in production[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8559259Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Categorization[2m > [22mshould categorize secrets correctly[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8561729Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Access Logging[2m > [22mshould log secret access[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8564074Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSecret Access Logging[2m > [22mshould limit audit log size[32m 4[2mms[22m[39m
2025-08-14T21:00:53.8566407Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould track rotation status[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8568962Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould identify overdue rotations[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8571445Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mRotation Status[2m > [22mshould identify upcoming rotation needs[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8573927Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mSummary Generation[2m > [22mshould generate accurate summary[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8576559Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould return healthy status for good configuration[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8579332Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould return warning status for issues[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8581807Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mHealth Status[2m > [22mshould include rotation status in health check[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8584551Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mEnvironment-Specific Validation[2m > [22mshould be more permissive in development[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8587436Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mEnvironment-Specific Validation[2m > [22mshould be strict in production[32m 0[2mms[22m[39m
2025-08-14T21:00:53.8614003Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mLogging[2m > [22mshould log secrets status without revealing values[32m 1[2mms[22m[39m
2025-08-14T21:00:53.8616716Z  [32m✓[39m src/lib/__tests__/secrets-management.test.ts[2m > [22mSecrets Management System[2m > [22mIntegration with Environment Validation[2m > [22mshould complement environment validation[32m 0[2mms[22m[39m
2025-08-14T21:00:54.5981566Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track page load time[32m 5[2mms[22m[39m
2025-08-14T21:00:54.5983737Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track API response times[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5985928Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track API errors for 4xx/5xx status codes[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5988238Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Tracking[2m > [22mshould track user interactions[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5990285Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCustom Metrics[2m > [22mshould track custom metrics with tags[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5992265Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCustom Metrics[2m > [22mshould track business events[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5993744Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mUser Tracking[2m > [22mshould set user information[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5994858Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mTransactions[2m > [22mshould create and finish transactions[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5996063Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mTransactions[2m > [22mshould track transaction duration as metric[32m 1[2mms[22m[39m
2025-08-14T21:00:54.5997410Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mError Tracking[2m > [22mshould capture exceptions[32m 5[2mms[22m[39m
2025-08-14T21:00:54.5998574Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mError Tracking[2m > [22mshould capture messages with different levels[32m 0[2mms[22m[39m
2025-08-14T21:00:54.5999716Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mCore Web Vitals[2m > [22mshould collect Core Web Vitals[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6000815Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMetrics Filtering[2m > [22mshould filter metrics by name[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6001921Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMetrics Filtering[2m > [22mshould filter metrics by time range[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6003085Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mHealth Monitoring[2m > [22mshould report monitoring health status[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6004315Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mHealth Monitoring[2m > [22mshould report degraded status with many errors[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6005611Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mExternal Integration[2m > [22mshould handle missing external APM services gracefully[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6007050Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mExternal Integration[2m > [22mshould send to external services when available[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6008456Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMemory Management[2m > [22mshould limit metrics storage to prevent memory leaks[32m 12[2mms[22m[39m
2025-08-14T21:00:54.6009948Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mMemory Management[2m > [22mshould limit events storage to prevent memory leaks[32m 4[2mms[22m[39m
2025-08-14T21:00:54.6011286Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Wrapper[2m > [22mshould wrap functions with monitoring[32m 1[2mms[22m[39m
2025-08-14T21:00:54.6012522Z  [32m✓[39m src/lib/__tests__/monitoring.test.ts[2m > [22mMonitoringService[2m > [22mPerformance Wrapper[2m > [22mshould handle function errors and track them[32m 2[2mms[22m[39m
2025-08-14T21:00:55.3814662Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mMessage Sending Success Scenarios[2m > [22mshould send message successfully with valid payload[32m 5[2mms[22m[39m
2025-08-14T21:00:55.3817535Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mMessage Sending Success Scenarios[2m > [22mshould include request metadata in payload[32m 1[2mms[22m[39m
2025-08-14T21:00:55.3819655Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould throw validation error for missing webhook URL[32m 1[2mms[22m[39m
2025-08-14T21:00:55.6919069Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle HTTP error responses[33m 302[2mms[22m[39m
2025-08-14T21:00:56.1961284Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle network errors[33m 302[2mms[22m[39m
2025-08-14T21:00:56.1963722Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mError Handling[2m > [22mshould handle malformed response format[32m 1[2mms[22m[39m
2025-08-14T21:00:56.2972673Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mBasic Retry Logic[2m > [22mshould retry on retryable errors and eventually succeed[33m 302[2mms[22m[39m
2025-08-14T21:00:56.2976051Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mBasic Retry Logic[2m > [22mshould not retry on non-retryable errors[32m 2[2mms[22m[39m
2025-08-14T21:00:56.2978048Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mWebhook Payload Validation[2m > [22mshould validate required payload fields[32m 1[2mms[22m[39m
2025-08-14T21:00:56.2979930Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mWebhook Payload Validation[2m > [22mshould include optional payload fields when provided[32m 1[2mms[22m[39m
2025-08-14T21:00:56.2981752Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mPerformance and Metrics[2m > [22mshould track request metrics on success[32m 1[2mms[22m[39m
2025-08-14T21:00:56.6043068Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mPerformance and Metrics[2m > [22mshould track error metrics on failures[33m 302[2mms[22m[39m
2025-08-14T21:00:56.6044977Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mHealth Check[2m > [22mshould perform health check successfully[32m 1[2mms[22m[39m
2025-08-14T21:00:56.8133689Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mHealth Check[2m > [22mshould return unhealthy status on errors[33m 302[2mms[22m[39m
2025-08-14T21:00:56.8137244Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould include standard headers in all requests[32m 1[2mms[22m[39m
2025-08-14T21:00:56.8139371Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould generate unique request IDs[32m 1[2mms[22m[39m
2025-08-14T21:00:56.8141231Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould provide circuit breaker configuration methods[32m 0[2mms[22m[39m
2025-08-14T21:00:56.8143062Z  [32m✓[39m src/lib/__tests__/webhookService.basic.test.ts[2m > [22mWebhookService - Basic Tests[2m > [22mConfiguration and Security[2m > [22mshould allow manual circuit breaker reset[32m 0[2mms[22m[39m
2025-08-14T21:00:57.7083449Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould create enhanced error reports with session info[32m 7[2mms[22m[39m
2025-08-14T21:00:57.7086248Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould generate fingerprints for error grouping[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7089061Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mEnhanced Error Reports[2m > [22mshould include release and environment information[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7091682Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould add breadcrumbs with proper categorization[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7093578Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould limit breadcrumb storage[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7094960Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mBreadcrumb System[2m > [22mshould include breadcrumbs in error reports[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7096352Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAPI Failure Tracking[2m > [22mshould track API failures with detailed context[32m 2[2mms[22m[39m
2025-08-14T21:00:57.7097870Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAPI Failure Tracking[2m > [22mshould add breadcrumbs for API failures[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7099253Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAuthentication Error Tracking[2m > [22mshould track auth errors with context[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7100659Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mAuthentication Error Tracking[2m > [22mshould add breadcrumbs for auth events[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7102009Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mUser Action Tracking[2m > [22mshould track user actions as breadcrumbs[32m 0[2mms[22m[39m
2025-08-14T21:00:57.7103319Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mUser Action Tracking[2m > [22mshould handle different action types[32m 0[2mms[22m[39m
2025-08-14T21:00:57.7104572Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould set and retrieve tags[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7105864Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould merge tags when setting multiple times[32m 0[2mms[22m[39m
2025-08-14T21:00:57.7107779Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mTags Management[2m > [22mshould include tags in error reports[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7109104Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mSession Integration[2m > [22mshould include session ID in error reports[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7110365Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mSession Integration[2m > [22mshould set user context[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7111639Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mPerformance[2m > [22mshould handle high volume of errors efficiently[32m 56[2mms[22m[39m
2025-08-14T21:00:57.7515023Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mPerformance[2m > [22mshould limit stored errors to prevent memory leaks[32m 127[2mms[22m[39m
2025-08-14T21:00:57.7517716Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould persist errors to localStorage[32m 2[2mms[22m[39m
2025-08-14T21:00:57.7520136Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould persist breadcrumbs to localStorage[32m 1[2mms[22m[39m
2025-08-14T21:00:57.7522714Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mData Persistence[2m > [22mshould handle localStorage errors gracefully[32m 4[2mms[22m[39m
2025-08-14T21:00:57.7524434Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mExternal Monitoring Integration[2m > [22mshould send errors to external monitoring asynchronously[32m 23[2mms[22m[39m
2025-08-14T21:00:57.7526029Z  [32m✓[39m src/lib/__tests__/errorTracking.enhanced.test.ts[2m > [22mEnhanced Error Tracking[2m > [22mExternal Monitoring Integration[2m > [22mshould send breadcrumbs to external monitoring[32m 11[2mms[22m[39m
2025-08-14T21:00:58.4665231Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.template for development[32m 3[2mms[22m[39m
2025-08-14T21:00:58.4667681Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.staging.template for staging[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4670457Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment Template Files[2m > [22mshould have .env.production.template for production[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4672206Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include all required variables in development template[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4673876Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include production-specific variables in production template[32m 0[2mms[22m[39m
2025-08-14T21:00:58.4675516Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Content Validation[2m > [22mshould include staging-specific variables in staging template[32m 0[2mms[22m[39m
2025-08-14T21:00:58.4677270Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mSecurity Annotations[2m > [22mshould have security warnings in all templates[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4679175Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mSecurity Annotations[2m > [22mshould mark sensitive variables appropriately[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4680641Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Format Validation[2m > [22mshould use proper environment variable format[32m 2[2mms[22m[39m
2025-08-14T21:00:58.4683269Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Format Validation[2m > [22mshould have consistent variable naming[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4685996Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Completeness[2m > [22mshould cover all configuration categories[32m 0[2mms[22m[39m
2025-08-14T21:00:58.4689050Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mTemplate Completeness[2m > [22mshould provide example values where appropriate[32m 0[2mms[22m[39m
2025-08-14T21:00:58.4692032Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mEnvironment-Specific Differences[2m > [22mshould have appropriate differences between environments[32m 1[2mms[22m[39m
2025-08-14T21:00:58.4694901Z  [32m✓[39m src/lib/__tests__/config-templates.test.ts[2m > [22mConfiguration Templates Validation[2m > [22mDocumentation Quality[2m > [22mshould have comprehensive comments[32m 1[2mms[22m[39m
2025-08-14T21:01:00.7513582Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use webhook service with proper payload structure[32m 3[2mms[22m[39m
2025-08-14T21:01:00.7516427Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould handle webhook service errors gracefully[32m 2[2mms[22m[39m
2025-08-14T21:01:00.8522944Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use fallback response when circuit breaker is open[33m 1533[2mms[22m[39m
2025-08-14T21:01:02.4967818Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould use fallback response when webhook URL not configured[33m 1735[2mms[22m[39m
2025-08-14T21:01:02.4970024Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould include conversation ID in webhook payload when provided[32m 2[2mms[22m[39m
2025-08-14T21:01:02.4971705Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mEnhanced sendMessageToAI[2m > [22mshould handle missing conversation ID gracefully[32m 1[2mms[22m[39m
2025-08-14T21:01:02.4973249Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould return webhook health status and metrics[32m 1[2mms[22m[39m
2025-08-14T21:01:02.4974794Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould handle health check errors gracefully[32m 0[2mms[22m[39m
2025-08-14T21:01:02.4976277Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mWebhook Status Monitoring[2m > [22mshould detect when webhook is not configured[32m 0[2mms[22m[39m
2025-08-14T21:01:02.4978707Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mIntegration with Existing Features[2m > [22mshould maintain backward compatibility with existing methods[32m 0[2mms[22m[39m
2025-08-14T21:01:02.4980383Z  [32m✓[39m src/lib/__tests__/chatService.enhanced.test.ts[2m > [22mChatService - Enhanced Integration[2m > [22mIntegration with Existing Features[2m > [22mshould pass conversation ID to enhanced webhook service[32m 1[2mms[22m[39m
2025-08-14T21:01:03.4936852Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould render the tools button with correct selected count[32m 43[2mms[22m[39m
2025-08-14T21:01:03.4939743Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould render compact version correctly[32m 12[2mms[22m[39m
2025-08-14T21:01:03.4942141Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mrendering[2m > [22mshould show loading state[32m 5[2mms[22m[39m
2025-08-14T21:01:03.4944624Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool selection[2m > [22mshould toggle tool selection when checkbox is clicked[32m 32[2mms[22m[39m
2025-08-14T21:01:03.6026262Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool selection[2m > [22mshould display tools grouped by category[32m 14[2mms[22m[39m
2025-08-14T21:01:03.6043609Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mselected tools display[2m > [22mshould show correct selected count in main label[32m 9[2mms[22m[39m
2025-08-14T21:01:03.6047937Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mselected tools display[2m > [22mshould show "No tools selected" message when none are selected[32m 15[2mms[22m[39m
2025-08-14T21:01:03.6050658Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool information display[2m > [22mshould display tool names and descriptions[32m 21[2mms[22m[39m
2025-08-14T21:01:03.6053283Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mtool information display[2m > [22mshould show helpful message about tool usage[32m 18[2mms[22m[39m
2025-08-14T21:01:03.6055894Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22maccessibility[2m > [22mshould have proper aria-label for the main button[32m 13[2mms[22m[39m
2025-08-14T21:01:03.6058642Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22maccessibility[2m > [22mshould update aria-label when selection changes[32m 10[2mms[22m[39m
2025-08-14T21:01:03.6061137Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22merror handling[2m > [22mshould handle tools loading error gracefully[32m 10[2mms[22m[39m
2025-08-14T21:01:03.6142458Z  [32m✓[39m src/components/chat/__tests__/ToolsSelector.test.tsx[2m > [22mToolsSelector[2m > [22mdropdown behavior[2m > [22mshould open and close dropdown correctly[32m 12[2mms[22m[39m
2025-08-14T21:01:04.4246349Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22minitialization[2m > [22mshould initialize with default tools when user is not logged in[32m 16[2mms[22m[39m
2025-08-14T21:01:04.4252988Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22minitialization[2m > [22mshould load saved preferences from localStorage when user is logged in[32m 4[2mms[22m[39m
2025-08-14T21:01:04.4255603Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mtool selection[2m > [22mshould toggle tool selection correctly[32m 5[2mms[22m[39m
2025-08-14T21:01:04.4258072Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mtool selection[2m > [22mshould save selections to localStorage when changed[32m 5[2mms[22m[39m
2025-08-14T21:01:04.4260174Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mgetSelectedToolIds[2m > [22mshould return only enabled tool IDs[32m 4[2mms[22m[39m
2025-08-14T21:01:04.4262248Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mpreferences management[2m > [22mshould update preferences correctly[32m 3[2mms[22m[39m
2025-08-14T21:01:04.4264401Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22mresetToDefaults[2m > [22mshould reset to default selections and preferences[32m 3[2mms[22m[39m
2025-08-14T21:01:04.4266633Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22merror handling[2m > [22mshould handle localStorage errors gracefully[32m 3[2mms[22m[39m
2025-08-14T21:01:04.4269023Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22manalytics[2m > [22mshould generate session ID when recording usage[32m 6[2mms[22m[39m
2025-08-14T21:01:04.4271189Z  [32m✓[39m src/hooks/__tests__/useTools.test.ts[2m > [22museTools[2m > [22manalytics[2m > [22mshould not record usage when analytics is disabled[32m 4[2mms[22m[39m
2025-08-14T21:01:05.3320135Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mrenders initial bug type selection step[32m 38[2mms[22m[39m
2025-08-14T21:01:05.3322553Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mprogresses through form steps correctly[32m 7[2mms[22m[39m
2025-08-14T21:01:05.3324768Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mvalidates required fields[32m 32[2mms[22m[39m
2025-08-14T21:01:05.3327176Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles form submission successfully[32m 13[2mms[22m[39m
2025-08-14T21:01:05.3329523Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mdisplays success message after submission[32m 4[2mms[22m[39m
2025-08-14T21:01:05.3532926Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles form cancellation[32m 13[2mms[22m[39m
2025-08-14T21:01:05.3535090Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22msupports auto-save functionality[32m 6[2mms[22m[39m
2025-08-14T21:01:05.3536332Z  [32m✓[39m src/components/bug-report/__tests__/BugReportForm.test.tsx[2m > [22mBugReportForm[2m > [22mhandles file attachment uploads[32m 9[2mms[22m[39m
2025-08-14T21:01:06.0438521Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould diagnose webhook connectivity and provide setup guidance[32m 4[2mms[22m[39m
2025-08-14T21:01:06.0440483Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould test webhook response format expectations[32m 0[2mms[22m[39m
2025-08-14T21:01:06.0442025Z  [32m✓[39m src/lib/__tests__/webhook.diagnostic.test.ts[2m > [22mWebhook Diagnostics[2m > [22mshould provide n8n workflow setup guidance[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7660680Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould create a new session on initialization[32m 2[2mms[22m[39m
2025-08-14T21:01:06.7662659Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould generate unique session IDs[32m 1[2mms[22m[39m
2025-08-14T21:01:06.7665520Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Creation[2m > [22mshould collect device information[32m 1[2mms[22m[39m
2025-08-14T21:01:06.7667543Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould set user ID and metadata[32m 1[2mms[22m[39m
2025-08-14T21:01:06.7668697Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould track auth events[32m 1[2mms[22m[39m
2025-08-14T21:01:06.7669806Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mUser Management[2m > [22mshould track failed auth events[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7670969Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Analytics[2m > [22mshould calculate session analytics[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7672149Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession Analytics[2m > [22mshould track most visited pages[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7673281Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession History[2m > [22mshould maintain session history[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7674450Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mSession History[2m > [22mshould include current session in history[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7675606Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mError Integration[2m > [22mshould increment error count[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7676763Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mData Persistence[2m > [22mshould attempt to persist session data[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7679201Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mData Persistence[2m > [22mshould handle localStorage errors gracefully[32m 1[2mms[22m[39m
2025-08-14T21:01:06.7681461Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mPerformance[2m > [22mshould limit session storage size[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7683876Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mPerformance[2m > [22mshould handle rapid user actions without performance issues[32m 0[2mms[22m[39m
2025-08-14T21:01:06.7686309Z  [32m✓[39m src/lib/__tests__/sessionTracking.test.ts[2m > [22mSession Tracking[2m > [22mMemory Management[2m > [22mshould not leak memory with continuous usage[32m 0[2mms[22m[39m
2025-08-14T21:01:07.4736716Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould return valid when all required variables are set[32m 3[2mms[22m[39m
2025-08-14T21:01:07.4739688Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould return errors when required variables are missing[32m 1[2mms[22m[39m
2025-08-14T21:01:07.4741177Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould validate URL format for Supabase URL[32m 1[2mms[22m[39m
2025-08-14T21:01:07.4742545Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould validate JWT format for Supabase anon key[32m 1[2mms[22m[39m
2025-08-14T21:01:07.4743876Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mvalidateEnvironment[2m > [22mshould add warnings for optional missing variables[32m 0[2mms[22m[39m
2025-08-14T21:01:07.4745727Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mgetEnvironmentInfo[2m > [22mshould return correct environment info structure[32m 2[2mms[22m[39m
2025-08-14T21:01:07.4747357Z  [32m✓[39m src/lib/__tests__/env-validation.test.ts[2m > [22mEnvironment Validation[2m > [22mgetEnvironmentInfo[2m > [22mshould detect development environment[32m 0[2mms[22m[39m
2025-08-14T21:01:08.1972971Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcreates bug report successfully[32m 4[2mms[22m[39m
2025-08-14T21:01:08.1975147Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcollects enhanced error context[32m 2[2mms[22m[39m
2025-08-14T21:01:08.1976584Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mintegrates with performance metrics[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1978290Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles database submission errors[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1979636Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mlogs submission activity[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1981021Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles missing browser info gracefully[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1982103Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcorrelates bug reports with errors[32m 2[2mms[22m[39m
2025-08-14T21:01:08.1983129Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mgenerates correlation IDs for tracking[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1984157Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mhandles network errors gracefully[32m 1[2mms[22m[39m
2025-08-14T21:01:08.1985187Z  [32m✓[39m src/lib/__tests__/bugReporting.test.ts[2m > [22mBugReportingService[2m > [22mcollects comprehensive monitoring data[32m 1[2mms[22m[39m
2025-08-14T21:01:08.9336645Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould initialize with correct default state[32m 15[2mms[22m[39m
2025-08-14T21:01:08.9338894Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould detect when app is installed in standalone mode[32m 2[2mms[22m[39m
2025-08-14T21:01:08.9340027Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle beforeinstallprompt event[32m 3[2mms[22m[39m
2025-08-14T21:01:08.9341063Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle successful installation[32m 4[2mms[22m[39m
2025-08-14T21:01:08.9342097Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle installation rejection[32m 3[2mms[22m[39m
2025-08-14T21:01:08.9343075Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle installation error[32m 3[2mms[22m[39m
2025-08-14T21:01:08.9344038Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould handle appinstalled event[32m 3[2mms[22m[39m
2025-08-14T21:01:08.9345039Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould clear error when clearError is called[32m 2[2mms[22m[39m
2025-08-14T21:01:08.9346155Z  [32m✓[39m src/hooks/__tests__/usePWAInstall.test.ts[2m > [22musePWAInstall[2m > [22mshould return false for install when no prompt is available[32m 2[2mms[22m[39m
2025-08-14T21:01:09.6067395Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould successfully send message to real n8n webhook
2025-08-14T21:01:09.6069305Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould perform health check successfully
2025-08-14T21:01:09.6071088Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould handle conversation context properly
2025-08-14T21:01:09.6072465Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould demonstrate error recovery and circuit breaker
2025-08-14T21:01:09.6073831Z  [2m[90m↓[39m[22m src/lib/__tests__/webhook.integration.test.ts[2m > [22mReal n8n Webhook Integration[2m > [22mshould test different message types and formats
2025-08-14T21:01:10.4782410Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installed" badge when app is installed[32m 34[2mms[22m[39m
2025-08-14T21:01:10.4784635Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installed" badge when in standalone mode[32m 5[2mms[22m[39m
2025-08-14T21:01:10.4786096Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Web App" badge when PWA is supported but not installed[32m 4[2mms[22m[39m
2025-08-14T21:01:10.4787615Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Browser" badge when PWA is not supported[32m 2[2mms[22m[39m
2025-08-14T21:01:10.4788873Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show install button when canInstall is true and showInstallButton is true[32m 5[2mms[22m[39m
2025-08-14T21:01:10.4790138Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould not show install button when showInstallButton is false[32m 3[2mms[22m[39m
2025-08-14T21:01:10.4791280Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould call install when install button is clicked[32m 7[2mms[22m[39m
2025-08-14T21:01:10.4792427Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Installing..." when isInstalling is true[32m 4[2mms[22m[39m
2025-08-14T21:01:10.4793528Z  [32m✓[39m src/components/pwa/__tests__/PWAStatus.test.tsx[2m > [22mPWAStatus[2m > [22mshould show "Install App" on mobile devices[32m 4[2mms[22m[39m
2025-08-14T21:01:11.2619809Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould initialize with empty state[32m 14[2mms[22m[39m
2025-08-14T21:01:11.2621162Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould load message history when user logs in[32m 55[2mms[22m[39m
2025-08-14T21:01:11.2622284Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould handle send message successfully[32m 4[2mms[22m[39m
2025-08-14T21:01:11.2623279Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould handle send message error[32m 4[2mms[22m[39m
2025-08-14T21:01:11.2624204Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould not send empty messages[32m 2[2mms[22m[39m
2025-08-14T21:01:11.2625084Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould clear messages[32m 2[2mms[22m[39m
2025-08-14T21:01:11.2625916Z  [32m✓[39m src/hooks/__tests__/useChat.test.ts[2m > [22museChat[2m > [22mshould clear error[32m 2[2mms[22m[39m
2025-08-14T21:01:11.9669022Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould generate correct HMAC-SHA256 signature[32m 2[2mms[22m[39m
2025-08-14T21:01:11.9672468Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould verify GitHub webhook signature correctly[32m 1[2mms[22m[39m
2025-08-14T21:01:11.9674237Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould reject invalid webhook signature[32m 0[2mms[22m[39m
2025-08-14T21:01:11.9675571Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Secret Synchronization Tests[2m > [22mshould handle missing signature gracefully[32m 0[2mms[22m[39m
2025-08-14T21:01:11.9676788Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Event Handler Tests[2m > [22mshould handle ping event correctly[32m 0[2mms[22m[39m
2025-08-14T21:01:11.9678243Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mWebhook Event Handler Tests[2m > [22mshould handle workflow_run event correctly[32m 0[2mms[22m[39m
2025-08-14T21:01:11.9679465Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mEnvironment Variable Tests[2m > [22mshould load webhook secret from environment[32m 1[2mms[22m[39m
2025-08-14T21:01:11.9680746Z  [32m✓[39m scripts/__tests__/webhook-server.test.js[2m > [22mEnvironment Variable Tests[2m > [22mshould use default value when environment variable not set[32m 0[2mms[22m[39m
2025-08-14T21:01:13.0020979Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould not render when canInstall is false[32m 21[2mms[22m[39m
2025-08-14T21:01:13.0023374Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould render install prompt when canInstall is true[32m 27[2mms[22m[39m
2025-08-14T21:01:13.0025714Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould call install when install button is clicked[32m 12[2mms[22m[39m
2025-08-14T21:01:13.0027586Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould show installing state when isInstalling is true[32m 8[2mms[22m[39m
2025-08-14T21:01:13.0029189Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould display error message when installError is present[32m 8[2mms[22m[39m
2025-08-14T21:01:13.0030689Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould dismiss prompt when X button is clicked[32m 10[2mms[22m[39m
2025-08-14T21:01:13.0191647Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould respect showDelay prop[32m 106[2mms[22m[39m
2025-08-14T21:01:13.0193773Z  [32m✓[39m src/components/pwa/__tests__/InstallPrompt.test.tsx[2m > [22mInstallPrompt[2m > [22mshould hide prompt after successful installation[32m 12[2mms[22m[39m
2025-08-14T21:01:19.2731026Z  [32m✓[39m src/lib/__tests__/webhook.live.test.ts[2m > [22mLive Webhook Test[2m > [22mshould test the actual n8n webhook with Hello JARVIS message[33m 5515[2mms[22m[39m
2025-08-14T21:02:41.5244742Z 
2025-08-14T21:02:41.5245802Z 🚨 TIMEOUT: Forcing exit after 2 minutes
2025-08-14T21:02:41.5335554Z ✅ All tests passed successfully
2025-08-14T21:02:46.5378759Z ##[group]Run echo "🔧 Running code linting..."
2025-08-14T21:02:46.5379126Z [36;1mecho "🔧 Running code linting..."[0m
2025-08-14T21:02:46.5379387Z [36;1m[0m
2025-08-14T21:02:46.5379569Z [36;1mif npm run lint; then[0m
2025-08-14T21:02:46.5379850Z [36;1m  echo "✅ Linting passed successfully"[0m
2025-08-14T21:02:46.5380115Z [36;1melse[0m
2025-08-14T21:02:46.5380387Z [36;1m  echo "⚠️ Linting issues found - continuing with deployment"[0m
2025-08-14T21:02:46.5380767Z [36;1m  echo "Note: Fix linting issues in future commits"[0m
2025-08-14T21:02:46.5381040Z [36;1mfi[0m
2025-08-14T21:02:46.5420961Z shell: /usr/bin/bash -e {0}
2025-08-14T21:02:46.5421185Z env:
2025-08-14T21:02:46.5421349Z   NODE_VERSION: 20
2025-08-14T21:02:46.5421552Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:02:46.5421777Z ##[endgroup]
2025-08-14T21:02:46.5481214Z 🔧 Running code linting...
2025-08-14T21:02:46.6597576Z 
2025-08-14T21:02:46.6600761Z > jarvis-chat@0.0.0 lint
2025-08-14T21:02:46.6602456Z > eslint .
2025-08-14T21:02:46.6602672Z 
2025-08-14T21:02:53.7844290Z ✅ Linting passed successfully
2025-08-14T21:02:53.7891507Z ##[group]Run echo "📊 Running TypeScript type checking..."
2025-08-14T21:02:53.7892306Z [36;1mecho "📊 Running TypeScript type checking..."[0m
2025-08-14T21:02:53.7892825Z [36;1m[0m
2025-08-14T21:02:53.7893155Z [36;1mif npm run type-check; then[0m
2025-08-14T21:02:53.7893679Z [36;1m  echo "✅ Type checking passed successfully"[0m
2025-08-14T21:02:53.7894171Z [36;1melse[0m
2025-08-14T21:02:53.7894520Z [36;1m  echo "❌ Type checking failed"[0m
2025-08-14T21:02:53.7894987Z [36;1m  [0m
2025-08-14T21:02:53.7895342Z [36;1m  # Check if force deploy is enabled[0m
2025-08-14T21:02:53.7895818Z [36;1m  if [ "" = "true" ]; then[0m
2025-08-14T21:02:53.7896425Z [36;1m    echo "⚠️ Force deploy enabled - continuing despite type errors"[0m
2025-08-14T21:02:53.7897224Z [36;1m  else[0m
2025-08-14T21:02:53.7897652Z [36;1m    echo "🛑 Deployment cancelled due to type errors"[0m
2025-08-14T21:02:53.7898169Z [36;1m    exit 1[0m
2025-08-14T21:02:53.7898505Z [36;1m  fi[0m
2025-08-14T21:02:53.7898862Z [36;1mfi[0m
2025-08-14T21:02:53.7960971Z shell: /usr/bin/bash -e {0}
2025-08-14T21:02:53.7961379Z env:
2025-08-14T21:02:53.7961695Z   NODE_VERSION: 20
2025-08-14T21:02:53.7962072Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:02:53.7962485Z ##[endgroup]
2025-08-14T21:02:53.8076561Z 📊 Running TypeScript type checking...
2025-08-14T21:02:53.9172614Z 
2025-08-14T21:02:53.9173255Z > jarvis-chat@0.0.0 type-check
2025-08-14T21:02:53.9173785Z > tsc --noEmit
2025-08-14T21:02:53.9174049Z 
2025-08-14T21:02:54.0908732Z ✅ Type checking passed successfully
2025-08-14T21:02:54.0934308Z ##[group]Run echo "🏗️ Building application for production..."
2025-08-14T21:02:54.0934757Z [36;1mecho "🏗️ Building application for production..."[0m
2025-08-14T21:02:54.0935053Z [36;1m[0m
2025-08-14T21:02:54.0935237Z [36;1m# Set build environment[0m
2025-08-14T21:02:54.0935482Z [36;1mexport NODE_ENV=production[0m
2025-08-14T21:02:54.0935715Z [36;1m[0m
2025-08-14T21:02:54.0935889Z [36;1mif npm run build; then[0m
2025-08-14T21:02:54.0936149Z [36;1m  echo "✅ Build completed successfully"[0m
2025-08-14T21:02:54.0936411Z [36;1m  [0m
2025-08-14T21:02:54.0936590Z [36;1m  # Display build info[0m
2025-08-14T21:02:54.0936828Z [36;1m  if [ -d "dist" ]; then[0m
2025-08-14T21:02:54.0937295Z [36;1m    echo "📊 Build artifacts:"[0m
2025-08-14T21:02:54.0937544Z [36;1m    ls -la dist/[0m
2025-08-14T21:02:54.0937756Z [36;1m    du -sh dist/[0m
2025-08-14T21:02:54.0937954Z [36;1m  fi[0m
2025-08-14T21:02:54.0938343Z [36;1melse[0m
2025-08-14T21:02:54.0938556Z [36;1m  echo "❌ Build failed"[0m
2025-08-14T21:02:54.0938773Z [36;1m  exit 1[0m
2025-08-14T21:02:54.0938947Z [36;1mfi[0m
2025-08-14T21:02:54.0995921Z shell: /usr/bin/bash -e {0}
2025-08-14T21:02:54.0996331Z env:
2025-08-14T21:02:54.0996635Z   NODE_VERSION: 20
2025-08-14T21:02:54.0997228Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:02:54.0997654Z ##[endgroup]
2025-08-14T21:02:54.1085247Z 🏗️ Building application for production...
2025-08-14T21:02:54.2310179Z 
2025-08-14T21:02:54.2310742Z > jarvis-chat@0.0.0 build
2025-08-14T21:02:54.2311244Z > vite build
2025-08-14T21:02:54.2311443Z 
2025-08-14T21:02:54.4765969Z [36mvite v7.0.6 [32mbuilding for production...[36m[39m
2025-08-14T21:02:54.7830090Z transforming...
2025-08-14T21:03:03.0571816Z [32m✓[39m 2854 modules transformed.
2025-08-14T21:03:03.6410293Z rendering chunks...
2025-08-14T21:03:03.7289390Z [33m[plugin vite:reporter] 
2025-08-14T21:03:03.7296381Z (!) /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/sessionTracking.ts is dynamically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts but also statically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/contexts/AuthContext.tsx, dynamic import will not move module into another chunk.
2025-08-14T21:03:03.7299067Z [39m
2025-08-14T21:03:03.7299461Z [33m[plugin vite:reporter] 
2025-08-14T21:03:03.7303377Z (!) /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/externalMonitoring.ts is dynamically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts, /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/lib/errorTracking.ts but also statically imported by /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT/jarvis-chat/src/contexts/AuthContext.tsx, dynamic import will not move module into another chunk.
2025-08-14T21:03:03.7306400Z [39m
2025-08-14T21:03:03.9394584Z computing gzip size...
2025-08-14T21:03:03.9666405Z [2mdist/[22m[32mindex.html                          [39m[1m[2m  2.23 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m
2025-08-14T21:03:03.9677139Z [2mdist/[22m[2massets/[22m[35mmain-DyCW2CH7.css            [39m[1m[2m 53.99 kB[22m[1m[22m[2m │ gzip:   9.92 kB[22m
2025-08-14T21:03:03.9678806Z [2mdist/[22m[2massets/[22m[36mvendor-query-DJprwG_K.js     [39m[1m[2m  0.07 kB[22m[1m[22m[2m │ gzip:   0.07 kB[22m
2025-08-14T21:03:03.9680451Z [2mdist/[22m[2massets/[22m[36mLoginPage-Cu1uydeP.js        [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
2025-08-14T21:03:03.9683119Z [2mdist/[22m[36msw.js                               [39m[1m[2m  1.26 kB[22m[1m[22m[2m │ gzip:   0.64 kB[22m
2025-08-14T21:03:03.9684650Z [2mdist/[22m[2massets/[22m[36mNotFound-DGr8NtoP.js         [39m[1m[2m  1.73 kB[22m[1m[22m[2m │ gzip:   0.68 kB[22m
2025-08-14T21:03:03.9686675Z [2mdist/[22m[2massets/[22m[36mChatPage-B2KOMn2Q.js         [39m[1m[2m  3.14 kB[22m[1m[22m[2m │ gzip:   1.40 kB[22m
2025-08-14T21:03:03.9688302Z [2mdist/[22m[2massets/[22m[36mprofiler-Dj6Kf4y9.js         [39m[1m[2m  5.34 kB[22m[1m[22m[2m │ gzip:   2.45 kB[22m
2025-08-14T21:03:03.9689687Z [2mdist/[22m[2massets/[22m[36mHealthPage-wNPCv5DQ.js       [39m[1m[2m  7.34 kB[22m[1m[22m[2m │ gzip:   1.94 kB[22m
2025-08-14T21:03:03.9691106Z [2mdist/[22m[2massets/[22m[36mTasksPage-D3TLHEwI.js        [39m[1m[2m  7.77 kB[22m[1m[22m[2m │ gzip:   2.15 kB[22m
2025-08-14T21:03:03.9692493Z [2mdist/[22m[2massets/[22m[36mDashboard-B8mpYaWV.js        [39m[1m[2m  8.30 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
2025-08-14T21:03:03.9693905Z [2mdist/[22m[2massets/[22m[36mSettingsPage-C02qJ2xX.js     [39m[1m[2m  9.43 kB[22m[1m[22m[2m │ gzip:   2.36 kB[22m
2025-08-14T21:03:03.9695340Z [2mdist/[22m[2massets/[22m[36mstartRecording-B84evlzu.js   [39m[1m[2m 19.41 kB[22m[1m[22m[2m │ gzip:   7.60 kB[22m
2025-08-14T21:03:03.9697190Z [2mdist/[22m[2massets/[22m[36mvendor-react-2sXmwtUU.js     [39m[1m[2m 44.96 kB[22m[1m[22m[2m │ gzip:  16.06 kB[22m
2025-08-14T21:03:03.9698625Z [2mdist/[22m[2massets/[22m[36mservices-CnM36BHg.js         [39m[1m[2m 61.25 kB[22m[1m[22m[2m │ gzip:  17.93 kB[22m
2025-08-14T21:03:03.9700030Z [2mdist/[22m[2massets/[22m[36mbuild.umd-DxMfbSb1.js        [39m[1m[2m 63.13 kB[22m[1m[22m[2m │ gzip:  17.74 kB[22m
2025-08-14T21:03:03.9701232Z [2mdist/[22m[2massets/[22m[36mvendor-form-BJjVzX-u.js      [39m[1m[2m 71.27 kB[22m[1m[22m[2m │ gzip:  21.61 kB[22m
2025-08-14T21:03:03.9702441Z [2mdist/[22m[2massets/[22m[36mcomponents-auth-CSMafzv6.js  [39m[1m[2m 76.17 kB[22m[1m[22m[2m │ gzip:  21.39 kB[22m
2025-08-14T21:03:03.9703733Z [2mdist/[22m[2massets/[22m[36mvendor-ui-D1hAaaPE.js        [39m[1m[2m 98.19 kB[22m[1m[22m[2m │ gzip:  31.13 kB[22m
2025-08-14T21:03:03.9705188Z [2mdist/[22m[2massets/[22m[36mvendor-supabase-E0f6e1kF.js  [39m[1m[2m117.05 kB[22m[1m[22m[2m │ gzip:  32.42 kB[22m
2025-08-14T21:03:03.9706752Z [2mdist/[22m[2massets/[22m[36mcomponents-chat-CO6-SCDC.js  [39m[1m[2m125.07 kB[22m[1m[22m[2m │ gzip:  36.29 kB[22m
2025-08-14T21:03:03.9708294Z [2mdist/[22m[2massets/[22m[36mmain-CGerczDa.js             [39m[1m[2m149.62 kB[22m[1m[22m[2m │ gzip:  52.07 kB[22m
2025-08-14T21:03:03.9709603Z [2mdist/[22m[2massets/[22m[36mmain-yzTASifi.js             [39m[1m[2m248.20 kB[22m[1m[22m[2m │ gzip:  76.81 kB[22m
2025-08-14T21:03:03.9710904Z [2mdist/[22m[2massets/[22m[36mindex-Dw-dKVai.js            [39m[1m[2m374.66 kB[22m[1m[22m[2m │ gzip: 127.18 kB[22m
2025-08-14T21:03:03.9711642Z [32m✓ built in 9.47s[39m
2025-08-14T21:03:04.0553601Z ✅ Build completed successfully
2025-08-14T21:03:04.0554033Z 📊 Build artifacts:
2025-08-14T21:03:04.0570069Z total 48
2025-08-14T21:03:04.0571556Z drwxr-xr-x  5 runner docker  4096 Aug 14 21:03 .
2025-08-14T21:03:04.0572339Z drwxr-xr-x 14 runner docker  4096 Aug 14 21:03 ..
2025-08-14T21:03:04.0573016Z drwxr-xr-x  2 runner docker  4096 Aug 14 21:03 api
2025-08-14T21:03:04.0573683Z -rw-r--r--  1 runner docker 10611 Aug 14 21:03 api-docs.html
2025-08-14T21:03:04.0574410Z drwxr-xr-x  2 runner docker  4096 Aug 14 21:03 assets
2025-08-14T21:03:04.0575101Z drwxr-xr-x  2 runner docker  4096 Aug 14 21:03 icons
2025-08-14T21:03:04.0575783Z -rw-r--r--  1 runner docker  2226 Aug 14 21:03 index.html
2025-08-14T21:03:04.0576438Z -rw-r--r--  1 runner docker  1255 Aug 14 21:03 manifest.json
2025-08-14T21:03:04.0577575Z -rw-r--r--  1 runner docker  1257 Aug 14 21:03 sw.js
2025-08-14T21:03:04.0578011Z -rw-r--r--  1 runner docker  1497 Aug 14 21:03 vite.svg
2025-08-14T21:03:04.0666090Z 1.7M	dist/
2025-08-14T21:03:04.0711032Z ##[group]Run echo "🔍 Validating build artifacts..."
2025-08-14T21:03:04.0711691Z [36;1mecho "🔍 Validating build artifacts..."[0m
2025-08-14T21:03:04.0712163Z [36;1m[0m
2025-08-14T21:03:04.0712505Z [36;1mif [ ! -d "dist" ]; then[0m
2025-08-14T21:03:04.0712998Z [36;1m  echo "❌ Build directory 'dist' not found"[0m
2025-08-14T21:03:04.0713462Z [36;1m  exit 1[0m
2025-08-14T21:03:04.0713773Z [36;1mfi[0m
2025-08-14T21:03:04.0714067Z [36;1m[0m
2025-08-14T21:03:04.0714416Z [36;1mif [ ! -f "dist/index.html" ]; then[0m
2025-08-14T21:03:04.0714951Z [36;1m  echo "❌ Main index.html not found in build"[0m
2025-08-14T21:03:04.0715428Z [36;1m  exit 1[0m
2025-08-14T21:03:04.0715730Z [36;1mfi[0m
2025-08-14T21:03:04.0716027Z [36;1m[0m
2025-08-14T21:03:04.0716354Z [36;1m# Check for critical assets[0m
2025-08-14T21:03:04.0717447Z [36;1mif ls dist/assets/*.js 1> /dev/null 2>&1; then[0m
2025-08-14T21:03:04.0718166Z [36;1m  echo "✅ JavaScript assets found"[0m
2025-08-14T21:03:04.0719035Z [36;1melse[0m
2025-08-14T21:03:04.0719564Z [36;1m  echo "⚠️ No JavaScript assets found"[0m
2025-08-14T21:03:04.0720190Z [36;1mfi[0m
2025-08-14T21:03:04.0720760Z [36;1m[0m
2025-08-14T21:03:04.0721558Z [36;1mif ls dist/assets/*.css 1> /dev/null 2>&1; then[0m
2025-08-14T21:03:04.0722240Z [36;1m  echo "✅ CSS assets found"[0m
2025-08-14T21:03:04.0722954Z [36;1melse[0m
2025-08-14T21:03:04.0723497Z [36;1m  echo "⚠️ No CSS assets found"[0m
2025-08-14T21:03:04.0741507Z [36;1mfi[0m
2025-08-14T21:03:04.0741860Z [36;1m[0m
2025-08-14T21:03:04.0742272Z [36;1mecho "✅ Build artifacts validation completed"[0m
2025-08-14T21:03:04.0802038Z shell: /usr/bin/bash -e {0}
2025-08-14T21:03:04.0802432Z env:
2025-08-14T21:03:04.0802718Z   NODE_VERSION: 20
2025-08-14T21:03:04.0803092Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:03:04.0803504Z ##[endgroup]
2025-08-14T21:03:04.0886049Z 🔍 Validating build artifacts...
2025-08-14T21:03:04.0901688Z ✅ JavaScript assets found
2025-08-14T21:03:04.0914813Z ✅ CSS assets found
2025-08-14T21:03:04.0915434Z ✅ Build artifacts validation completed
2025-08-14T21:03:04.0941780Z ##[group]Run echo "📤 Preparing deployment metadata..."
2025-08-14T21:03:04.0942190Z [36;1mecho "📤 Preparing deployment metadata..."[0m
2025-08-14T21:03:04.0942491Z [36;1m[0m
2025-08-14T21:03:04.0942680Z [36;1m# Create deployment metadata[0m
2025-08-14T21:03:04.0942959Z [36;1mcat > deployment-metadata.json << EOF[0m
2025-08-14T21:03:04.0943217Z [36;1m{[0m
2025-08-14T21:03:04.0943450Z [36;1m  "repository": "MADPANDA3D/J.A.R.V.I.S-PROJECT",[0m
2025-08-14T21:03:04.0943737Z [36;1m  "branch": "main",[0m
2025-08-14T21:03:04.0944028Z [36;1m  "commit_sha": "beb740c17231648b9a1f06da4a0fbfbd7c47bcc7",[0m
2025-08-14T21:03:04.0944499Z [36;1m  "commit_message": "docs: add webhook signature debugging tools and update deployment log[0m
2025-08-14T21:03:04.0944888Z [36;1m[0m
2025-08-14T21:03:04.0945198Z [36;1m- Add debug-webhook-signature.js: comprehensive signature testing script[0m
2025-08-14T21:03:04.0945738Z [36;1m- Add test-compact-signature.js: validates compact JSON signature method[0m
2025-08-14T21:03:04.0946216Z [36;1m- Update deployment log with latest CI run results showing 401 error[0m
2025-08-14T21:03:04.0946689Z [36;1m- Tools help diagnose and verify webhook signature authentication issues[0m
2025-08-14T21:03:04.0947545Z [36;1m- Support troubleshooting VPS webhook server integration problems[0m
2025-08-14T21:03:04.0947926Z [36;1m[0m
2025-08-14T21:03:04.0948201Z [36;1m🤖 Generated with [Claude Code](https://claude.ai/code)[0m
2025-08-14T21:03:04.0948524Z [36;1m[0m
2025-08-14T21:03:04.0948781Z [36;1mCo-Authored-By: Claude <noreply@anthropic.com>",[0m
2025-08-14T21:03:04.0949090Z [36;1m  "author": "Leo Lara",[0m
2025-08-14T21:03:04.0949342Z [36;1m  "workflow_run_id": "16976574215",[0m
2025-08-14T21:03:04.0949611Z [36;1m  "workflow_run_number": "63",[0m
2025-08-14T21:03:04.0949929Z [36;1m  "build_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",[0m
2025-08-14T21:03:04.0950222Z [36;1m  "node_version": "20",[0m
2025-08-14T21:03:04.0950472Z [36;1m  "environment": "production"[0m
2025-08-14T21:03:04.0950720Z [36;1m}[0m
2025-08-14T21:03:04.0950890Z [36;1mEOF[0m
2025-08-14T21:03:04.0951066Z [36;1m[0m
2025-08-14T21:03:04.0951272Z [36;1mecho "✅ Deployment metadata prepared:"[0m
2025-08-14T21:03:04.0951570Z [36;1mcat deployment-metadata.json[0m
2025-08-14T21:03:04.0989501Z shell: /usr/bin/bash -e {0}
2025-08-14T21:03:04.0989733Z env:
2025-08-14T21:03:04.0989902Z   NODE_VERSION: 20
2025-08-14T21:03:04.0990107Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:03:04.0990330Z ##[endgroup]
2025-08-14T21:03:04.1047532Z 📤 Preparing deployment metadata...
2025-08-14T21:03:04.1073668Z ✅ Deployment metadata prepared:
2025-08-14T21:03:04.1082186Z {
2025-08-14T21:03:04.1082982Z   "repository": "MADPANDA3D/J.A.R.V.I.S-PROJECT",
2025-08-14T21:03:04.1083708Z   "branch": "main",
2025-08-14T21:03:04.1084546Z   "commit_sha": "beb740c17231648b9a1f06da4a0fbfbd7c47bcc7",
2025-08-14T21:03:04.1086343Z   "commit_message": "docs: add webhook signature debugging tools and update deployment log
2025-08-14T21:03:04.1087444Z 
2025-08-14T21:03:04.1088191Z - Add debug-webhook-signature.js: comprehensive signature testing script
2025-08-14T21:03:04.1090142Z - Add test-compact-signature.js: validates compact JSON signature method
2025-08-14T21:03:04.1091332Z - Update deployment log with latest CI run results showing 401 error
2025-08-14T21:03:04.1092460Z - Tools help diagnose and verify webhook signature authentication issues
2025-08-14T21:03:04.1093582Z - Support troubleshooting VPS webhook server integration problems
2025-08-14T21:03:04.1094219Z 
2025-08-14T21:03:04.1094874Z 🤖 Generated with [Claude Code](https://claude.ai/code)
2025-08-14T21:03:04.1095290Z 
2025-08-14T21:03:04.1095630Z Co-Authored-By: Claude <noreply@anthropic.com>",
2025-08-14T21:03:04.1096196Z   "author": "Leo Lara",
2025-08-14T21:03:04.1096632Z   "workflow_run_id": "16976574215",
2025-08-14T21:03:04.1097334Z   "workflow_run_number": "63",
2025-08-14T21:03:04.1098141Z   "build_timestamp": "2025-08-14T21:03:04Z",
2025-08-14T21:03:04.1098686Z   "node_version": "20",
2025-08-14T21:03:04.1099091Z   "environment": "production"
2025-08-14T21:03:04.1099506Z }
2025-08-14T21:03:04.1135255Z ##[group]Run echo "🚀 Triggering VPS deployment..."
2025-08-14T21:03:04.1135928Z [36;1mecho "🚀 Triggering VPS deployment..."[0m
2025-08-14T21:03:04.1136441Z [36;1m[0m
2025-08-14T21:03:04.1137206Z [36;1m# Create deployment payload (compact JSON for proper signature calculation)[0m
2025-08-14T21:03:04.1140309Z [36;1mDEPLOYMENT_PAYLOAD='{"action":"completed","workflow_run":{"conclusion":"success","head_sha":"beb740c17231648b9a1f06da4a0fbfbd7c47bcc7","name":"Deploy to VPS"},"repository":{"name":"MADPANDA3D/J.A.R.V.I.S-PROJECT"},"pusher":{"name":"MADPANDA3D"},"ref":"refs/heads/main","metadata":{"version":"beb740c17231648b9a1f06da4a0fbfbd7c47bcc7","branch":"main","build_id":"16976574215","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","workflow_url":"https://github.com/MADPANDA3D/J.A.R.V.I.S-PROJECT/actions/runs/16976574215"}}'[0m
2025-08-14T21:03:04.1143182Z [36;1m[0m
2025-08-14T21:03:04.1143529Z [36;1m# Calculate webhook signature[0m
2025-08-14T21:03:04.1144510Z [36;1mWEBHOOK_SECRET="***"[0m
2025-08-14T21:03:04.1145344Z [36;1mSIGNATURE=$(echo -n "$DEPLOYMENT_PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | xxd -p -c 256)[0m
2025-08-14T21:03:04.1146179Z [36;1m[0m
2025-08-14T21:03:04.1146491Z [36;1m# Send webhook to VPS[0m
2025-08-14T21:03:04.1147275Z [36;1mHTTP_STATUS=$(curl -w "%{http_code}" -o /tmp/webhook_response.txt \[0m
2025-08-14T21:03:04.1147886Z [36;1m  -X POST \[0m
2025-08-14T21:03:04.1148292Z [36;1m  -H "Content-Type: application/json" \[0m
2025-08-14T21:03:04.1148832Z [36;1m  -H "X-GitHub-Event: workflow_run" \[0m
2025-08-14T21:03:04.1149370Z [36;1m  -H "X-Hub-Signature-256: sha256=$SIGNATURE" \[0m
2025-08-14T21:03:04.1149972Z [36;1m  -H "User-Agent: GitHub-Hookshot/deploy-workflow" \[0m
2025-08-14T21:03:04.1150542Z [36;1m  -d "$DEPLOYMENT_PAYLOAD" \[0m
2025-08-14T21:03:04.1151119Z [36;1m  "***/webhook/deploy" \[0m
2025-08-14T21:03:04.1151540Z [36;1m  --connect-timeout 10 \[0m
2025-08-14T21:03:04.1151986Z [36;1m  --max-time 30)[0m
2025-08-14T21:03:04.1152361Z [36;1m[0m
2025-08-14T21:03:04.1152665Z [36;1m# Check response[0m
2025-08-14T21:03:04.1153067Z [36;1mif [ "$HTTP_STATUS" -eq 200 ]; then[0m
2025-08-14T21:03:04.1153615Z [36;1m  echo "✅ VPS deployment webhook sent successfully"[0m
2025-08-14T21:03:04.1154243Z [36;1m  echo "Response:" $(cat /tmp/webhook_response.txt)[0m
2025-08-14T21:03:04.1154735Z [36;1melse[0m
2025-08-14T21:03:04.1155218Z [36;1m  echo "❌ VPS deployment webhook failed with status: $HTTP_STATUS"[0m
2025-08-14T21:03:04.1155930Z [36;1m  echo "Response:" $(cat /tmp/webhook_response.txt)[0m
2025-08-14T21:03:04.1156429Z [36;1m  exit 1[0m
2025-08-14T21:03:04.1156748Z [36;1mfi[0m
2025-08-14T21:03:04.1211868Z shell: /usr/bin/bash -e {0}
2025-08-14T21:03:04.1212250Z env:
2025-08-14T21:03:04.1212535Z   NODE_VERSION: 20
2025-08-14T21:03:04.1212892Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:03:04.1213306Z ##[endgroup]
2025-08-14T21:03:04.1275319Z 🚀 Triggering VPS deployment...
2025-08-14T21:03:04.1396080Z   % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
2025-08-14T21:03:04.1396864Z                                  Dload  Upload   Total   Spent    Left  Speed
2025-08-14T21:03:04.1397434Z 
2025-08-14T21:03:04.1699559Z   0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
2025-08-14T21:03:04.1700714Z 100   667  100   184  100   483   6071  15937 --:--:-- --:--:-- --:--:-- 22233
2025-08-14T21:03:04.1712874Z ✅ VPS deployment webhook sent successfully
2025-08-14T21:03:04.1727643Z Response: {"message":"Deployment initiated","status":"healthy","type":"success","timestamp":"2025-08-14T21:03:04.160Z","version":"beb740c","workflow_name":"Deploy to VPS","conclusion":"success"}
2025-08-14T21:03:04.1754178Z ##[group]Run echo "🎉 Build completed successfully!"
2025-08-14T21:03:04.1754786Z [36;1mecho "🎉 Build completed successfully!"[0m
2025-08-14T21:03:04.1755235Z [36;1mecho ""[0m
2025-08-14T21:03:04.1755586Z [36;1mecho "📋 Deployment Summary:"[0m
2025-08-14T21:03:04.1756150Z [36;1mecho "  • Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT"[0m
2025-08-14T21:03:04.1756644Z [36;1mecho "  • Branch: main"[0m
2025-08-14T21:03:04.1757227Z [36;1mecho "  • Commit: beb740c17231648b9a1f06da4a0fbfbd7c47bcc7"[0m
2025-08-14T21:03:04.1757647Z [36;1mecho "  • Build ID: 16976574215"[0m
2025-08-14T21:03:04.1757994Z [36;1mecho "  • Node.js: 20"[0m
2025-08-14T21:03:04.1758370Z [36;1mecho "  • Status: ✅ DEPLOYMENT TRIGGERED"[0m
2025-08-14T21:03:04.1758743Z [36;1mecho ""[0m
2025-08-14T21:03:04.1759261Z [36;1mecho "📡 Check VPS logs at: ***/dashboard"[0m
2025-08-14T21:03:04.1801799Z shell: /usr/bin/bash -e {0}
2025-08-14T21:03:04.1802034Z env:
2025-08-14T21:03:04.1802256Z   NODE_VERSION: 20
2025-08-14T21:03:04.1802459Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:03:04.1802689Z ##[endgroup]
2025-08-14T21:03:04.1862782Z 🎉 Build completed successfully!
2025-08-14T21:03:04.1864200Z 
2025-08-14T21:03:04.1865049Z 📋 Deployment Summary:
2025-08-14T21:03:04.1865763Z   • Repository: MADPANDA3D/J.A.R.V.I.S-PROJECT
2025-08-14T21:03:04.1866312Z   • Branch: main
2025-08-14T21:03:04.1867149Z   • Commit: beb740c17231648b9a1f06da4a0fbfbd7c47bcc7
2025-08-14T21:03:04.1867790Z   • Build ID: 16976574215
2025-08-14T21:03:04.1868215Z   • Node.js: 20
2025-08-14T21:03:04.1868692Z   • Status: ✅ DEPLOYMENT TRIGGERED
2025-08-14T21:03:04.1868997Z 
2025-08-14T21:03:04.1869652Z 📡 Check VPS logs at: ***/dashboard
2025-08-14T21:03:04.1907658Z ##[group]Run if [ "success" = "success" ]; then
2025-08-14T21:03:04.1908271Z [36;1mif [ "success" = "success" ]; then[0m
2025-08-14T21:03:04.1908815Z [36;1m  echo "✅ WORKFLOW COMPLETED SUCCESSFULLY"[0m
2025-08-14T21:03:04.1909493Z [36;1m  echo "🚀 VPS deployment will be triggered automatically via webhook"[0m
2025-08-14T21:03:04.1910106Z [36;1melse[0m
2025-08-14T21:03:04.1910466Z [36;1m  echo "❌ WORKFLOW FAILED"[0m
2025-08-14T21:03:04.1910956Z [36;1m  echo "🛑 No deployment will be triggered"[0m
2025-08-14T21:03:04.1911447Z [36;1mfi[0m
2025-08-14T21:03:04.1911729Z [36;1m[0m
2025-08-14T21:03:04.1912033Z [36;1mecho ""[0m
2025-08-14T21:03:04.1912403Z [36;1mecho "📋 Final Status: success"[0m
2025-08-14T21:03:04.1912962Z [36;1mecho "🕐 Completed at: $(date -u +%Y-%m-%dT%H:%M:%SZ)"[0m
2025-08-14T21:03:04.1968761Z shell: /usr/bin/bash -e {0}
2025-08-14T21:03:04.1969144Z env:
2025-08-14T21:03:04.1969455Z   NODE_VERSION: 20
2025-08-14T21:03:04.1969877Z   WORKING_DIRECTORY: jarvis-chat
2025-08-14T21:03:04.1970275Z ##[endgroup]
2025-08-14T21:03:04.2051242Z ✅ WORKFLOW COMPLETED SUCCESSFULLY
2025-08-14T21:03:04.2052164Z 🚀 VPS deployment will be triggered automatically via webhook
2025-08-14T21:03:04.2052618Z 
2025-08-14T21:03:04.2052901Z 📋 Final Status: success
2025-08-14T21:03:04.2064823Z 🕐 Completed at: 2025-08-14T21:03:04Z
2025-08-14T21:03:04.2126392Z Post job cleanup.
2025-08-14T21:03:04.3713244Z Cache hit occurred on the primary key node-cache-Linux-x64-npm-9a18259fac7913a495886720380a5439d83a5add66f3f6dd036d2fed991eeaa3, not saving cache.
2025-08-14T21:03:04.3855929Z Post job cleanup.
2025-08-14T21:03:04.4865661Z [command]/usr/bin/git version
2025-08-14T21:03:04.4935514Z git version 2.50.1
2025-08-14T21:03:04.5003217Z Temporarily overriding HOME='/home/runner/work/_temp/733864c2-905e-4c26-992f-0a99e1cd771a' before making global git config changes
2025-08-14T21:03:04.5006301Z Adding repository directory to the temporary git global config as a safe directory
2025-08-14T21:03:04.5025543Z [command]/usr/bin/git config --global --add safe.directory /home/runner/work/J.A.R.V.I.S-PROJECT/J.A.R.V.I.S-PROJECT
2025-08-14T21:03:04.5070426Z [command]/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
2025-08-14T21:03:04.5106660Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
2025-08-14T21:03:04.5362431Z [command]/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
2025-08-14T21:03:04.5387487Z http.https://github.com/.extraheader
2025-08-14T21:03:04.5401361Z [command]/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
2025-08-14T21:03:04.5443582Z [command]/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
2025-08-14T21:03:04.5872539Z Cleaning up orphan processes
2025-08-14T21:03:04.6190260Z Terminate orphan process: pid (2255) (sh)
2025-08-14T21:03:04.6214779Z Terminate orphan process: pid (2256) (node (vitest))
2025-08-14T21:03:04.6238463Z Terminate orphan process: pid (2279) (esbuild)
