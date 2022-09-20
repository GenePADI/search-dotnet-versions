const { Bitbucket } = require('bitbucket');
const { Octokit } = require('octokit');
const fs = require('fs');

const dotenv = require('dotenv');
dotenv.config();

const {
    BITBUCKET_DISABLED,
    BITBUCKET_PASSWORD,
    BITBUCKET_USERNAME,
    BITBUCKET_WORKSPACE,
    GITHUB_DISABLED,
    GITHUB_ORG,
    GITHUB_TOKEN,
} = process.env;

const enableBitBucket = !JSON.parse(BITBUCKET_DISABLED ?? 'false');
const enableGitHub = !JSON.parse(GITHUB_DISABLED ?? 'false');
const versions = [ 'netcoreapp2', 'netcoreapp3', 'net5', 'net6' ];

(async () => {
    const header = 'Platform,Repo,Project,Version,Owner,Should Upgrade,Link\r\n';
    const timestamp = +new Date;
    const filename = `net-versions-${timestamp}.csv`;
    fs.writeFileSync(filename, header);

    if (enableBitBucket) {
        await searchBitBucket(filename);
    }

    if (enableGitHub) {
        await searchGitHub(filename);
    }
})();

async function searchBitBucket(filename) {
    const clientOptions = {
        auth: {
            username: BITBUCKET_USERNAME,
            password: BITBUCKET_PASSWORD,
        },
    }

    const bitbucket = new Bitbucket(clientOptions);
    const workspace = BITBUCKET_WORKSPACE;
    const pagelen = 50;

    for (const version of versions)
    {
        const search_query = `ext:csproj ${version}`;
        var next;
        var page = 1;
    
        do {
            const { data } = await bitbucket.search
                .searchAccount({ search_query, workspace, pagelen, page });
    
            for (const value of data.values) {
                const href = value.file.links.self.href;
                const path = value.file.path;
                const repo = href.match(/\/padiww\/.*?\//g);
                const url = `https://bitbucket.org${repo}src/master/${path}`;
                const row = `BitBucket,${repo},${path},${version},,,${url}\r\n`;

                fs.appendFileSync(filename, row);
            }
    
            next = data.next;
            page++;
        } while (next)    
    }
}

async function searchGitHub(filename) {
    const per_page = 50;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    for (const version of versions)
    {
        const q = `org:${GITHUB_ORG} extension:csproj ${version}`;
        var perPageTotal = 0;
        var totalCount = -1;

        do {
            const { data } = await octokit.request('GET /search/code', {
                q,
                per_page,
            });

            for (const item of data.items) {
                const url = item.html_url;
                const path = item.path;    
                const repo = item.repository.full_name;
                const row = `GitHub,${repo},${path},${version},,,${url}\r\n`;

                fs.appendFileSync(filename, row);
            }
            
            totalCount = data.total_count;
            perPageTotal += per_page;
        } while (totalCount > perPageTotal)        
    }
}
