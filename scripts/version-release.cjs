#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

function git(command) {
    return execSync(command, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
    }).trim();
}

function getLatestTag() {
    try {
        return git(
            "git describe --tags --match 'v[0-9]*.[0-9]*.[0-9]*' --abbrev=0"
        );
    } catch {
        return null;
    }
}

function getCommitsSince(tag) {
    const range = tag ? `${tag}..HEAD` : "HEAD";

    // %B includes the complete commit message, including
    // BREAKING CHANGE declarations in the commit body.
    return git(`git log ${range} --format=%B`);
}

function getVersion() {
    const packageJson = JSON.parse(
        fs.readFileSync("package.json", "utf8")
    );

    if(!packageJson.version) {
        throw new Error("package.json does not contain a version");
    }

    return packageJson.version;
}

function parseVersion(version) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);

    if(!match) {
        throw new Error(
            `Unsupported version "${version}". Expected MAJOR.MINOR.PATCH.`
        );
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
    };
}

function determineBump(commits) {
    let bump = "none";

    const lines = commits.split("\n");

    for(const line of lines) {
        const subject = line.trim();

        if(!subject) {
            continue;
        }

        // A commit containing BREAKING CHANGE is a major release.
        if(/^BREAKING CHANGE:/i.test(subject)) {
            return "major";
        }

        // Conventional Commit with !:
        //
        // feat!: ...
        // fix!: ...
        // feat(api)!: ...
        //
        if(/^[a-zA-Z]+(\([^)]*\))?!:/.test(subject)) {
            return "major";
        }

        // Feature → minor release.
        if(/^feat(\([^)]*\))?:/.test(subject)) {
            if(bump !== "major") {
                bump = "minor";
            }

            continue;
        }

        // Fix → patch release.
        if(/^fix(\([^)]*\))?:/.test(subject)) {
            if(bump === "none") {
                bump = "patch";
            }
        }
    }

    return bump;
}

function incrementVersion(version, bump) {
    const parsed = parseVersion(version);

    switch(bump) {
        case "major":
            return `${parsed.major + 1}.0.0`;

        case "minor":
            return `${parsed.major}.${parsed.minor + 1}.0`;

        case "patch":
            return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;

        case "none":
            return version;

        default:
            throw new Error(`Unknown bump type: ${bump}`);
    }
}

function updatePackageJson(version) {
    const filename = "package.json";

    const packageJson = JSON.parse(
        fs.readFileSync(filename, "utf8")
    );

    packageJson.version = version;

    fs.writeFileSync(
        filename,
        JSON.stringify(packageJson, null, 4) + "\n"
    );
}

function updateManifest(version) {
    const filename = "manifest.xml";

    let manifest = fs.readFileSync(filename, "utf8");

    const versionElement =
        /(<version>\s*)\d+\.\d+\.\d+(\s*<\/version>)/;

    if(!versionElement.test(manifest)) {
        throw new Error(
            "Could not find <version>MAJOR.MINOR.PATCH</version> in manifest.xml"
        );
    }

    manifest = manifest.replace(
        versionElement,
        `$1${version}$2`
    );

    fs.writeFileSync(filename, manifest);
}

function main() {
    const currentVersion = getVersion();
    const latestTag = getLatestTag();

    console.log(`Current version: ${currentVersion}`);
    console.log(`Latest release tag: ${latestTag || "(none)"}`);

    const commits = getCommitsSince(latestTag);

    if(!commits) {
        console.log("No commits since the last release.");

        fs.appendFileSync(
            process.env.GITHUB_OUTPUT || "/dev/null",
            "released=false\n"
        );

        return;
    }

    console.log("\nCommits since last release:");
    console.log(commits);

    const bump = determineBump(commits);

    console.log(`\nRequired version bump: ${bump}`);

    if(bump === "none") {
        console.log("No release-worthy commits found.");

        fs.appendFileSync(
            process.env.GITHUB_OUTPUT || "/dev/null",
            "released=false\n"
        );

        return;
    }

    const newVersion = incrementVersion(currentVersion, bump);

    console.log(`New version: ${newVersion}`);

    updatePackageJson(newVersion);
    updateManifest(newVersion);

    fs.appendFileSync(
        process.env.GITHUB_OUTPUT || "/dev/null",
        [
            "released=true",
            `version=${newVersion}`,
            `bump=${bump}`,
        ].join("\n") + "\n"
    );
}

main();