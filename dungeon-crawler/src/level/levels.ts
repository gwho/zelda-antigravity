import { TileType } from '../types';

// Let's create level data arrays. 
// 12 columns by 10 rows. 
// A simple convention helper function converts multiline strings to the 2D enum array.
export interface LevelData {
    grid: TileType[][];
    spawnX: number; // Player spawn X
    spawnY: number; // Player spawn Y
}

// Convert string template like the zelda-js repo
function parseLevelString(str: string): TileType[][] {
    const lines = str.trim().split('\n').map(l => l.trimRight().padEnd(12, 'e'));

    // Safety check just to make it 12x10
    while (lines.length < 10) lines.push('e'.repeat(12));

    const grid: TileType[][] = [];
    for (let y = 0; y < 10; y++) {
        const row: TileType[] = [];
        for (let x = 0; x < 12; x++) {
            const char = lines[y]?.charAt(x) || 'e';
            row.push(char as TileType);
        }
        grid.push(row);
    }
    return grid;
}

// level 1: basic
const level1Str = `
ycccccc^cccw
a          b
a      *   b
a          b
%          b
a    (   ) b
a  *       b
a          b
a          b
xddddddddddz
`;

// level 2: obstacles and varied enemies
const level2Str = `
yccccccccccw
a          b
)  (    (  )
a          b
a     }    b
a          b
)          )
a  *       b
a          b
xdd)dd^dd)dz
`;

// level 3: harder layout
const level3Str = `
yccccccccccw
a   )  (   b
a          b
a  }    *  b
a          b
a   (  )   b
a          b
a  *    }  b
a          b
xddddddddddz
`;

export const levels: LevelData[] = [
    {
        grid: parseLevelString(level1Str),
        spawnX: 4,
        spawnY: 8 // Start near bottom
    },
    {
        grid: parseLevelString(level2Str),
        spawnX: 6,
        spawnY: 1 // Start near top
    },
    {
        grid: parseLevelString(level3Str),
        spawnX: 5,
        spawnY: 5 // Start in center
    }
];
