import { SkillLevel } from './app/lists/skill.level';

function getNumberForSkill(level: any): number {
    // maps skilllevel[1,5]
    return (parseInt(SkillLevel[level]));
}

function normalizeSkillLevel(level: number, min: number = 1, max: number = 5): number {
    let normalized = 0;
    normalized = ((level - min) * (1 - 0.2)) / ((max - min) + 0.2);
    return normalized === 0 ? 0.2 : normalized; // [0,1]
}

export function baseScore(resumeSkills, query) {
    let sumScore = 0;
    let sumWeight = 0;

    query.forEach((q) => {
        let weight = normalizeSkillLevel(getNumberForSkill(q.searchLevel));
        resumeSkills.forEach((r) => {
            let result = findNode(r, 0, q.searchSkill); // result + depth
            if(result) {
                sumScore += getNumberForSkill(result.node.level)*weight;
            }
        });
        sumWeight += weight;
    });

    if(sumScore === 0) return 0;
    sumScore /= sumWeight;  
   
    return +(sumScore*2).toFixed(1); /// { basescore / percentage } 
}

function findNode(currentNode, level, searchSkill) {
    if(currentNode.name.toLowerCase() === searchSkill.toLowerCase()) return { node: currentNode, level: level };

    for(let i = 0; i < currentNode.children.length; i++) {
        let currentChild = currentNode.children[i];
        let result = findNode(currentChild, level+1, searchSkill);
        if(result) return result;
    }

    return null;
}

function getParentOfChild(currentNode, currentLevel, childName, targetLevel)  {
    if((currentLevel + 1) === targetLevel && currentNode.children.filter((s) => {return s.name.toLowerCase() === childName.toLowerCase();}).length > 0) return currentNode;

    for(let i = 0; i < currentNode.children.length; i++) {
        let currentChild = currentNode.children[i];
        let result = getParentOfChild(currentChild, currentLevel+1, childName, targetLevel);
        if(result) return result;
    }

    return null;
}


export function bonusScore(resumeSkills, query) {
    let bonus = 0;
    let alreadyVisited = new Map();

    query.forEach((q) => { alreadyVisited.set(q.searchSkill, true); });

    query.forEach((q) => {
        resumeSkills.forEach((r) => {
            let node = findNode(r, 0, q.searchSkill);
            if(node) {
                if(node.node.children.length === 0) {
                    let siblings = getParentOfChild(r, 0, q.searchSkill, node.level).children.slice();
                    siblings.forEach((s) => {
                        if(!alreadyVisited.has(s.name)) {
                            alreadyVisited.set(s.name, true);
                            bonus = bonus + 1;
                        }
                    });
                    // calculate score from siblings
                } else {
                    let children = node.node.children;
                    children.forEach((s) => {
                        if(!alreadyVisited.has(s.name)) {
                            alreadyVisited.set(s.name, true);
                            bonus = bonus + 1;
                        }
                    });
                    // calculate score from children
                }
            }
        });
    });
    return bonus;
}