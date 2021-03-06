export interface Item {
  id?: string
  parentId?: string | null,
  [key: string]: any,
}

export interface TreeItem {
  id?: string,
  parentId?: string | null,
  [key: string]: Item | TreeItem[] | any,
}

export interface Config {
  id: string,
  parentId: string,
  dataField: string | null,
  nodesField: string
}

const defaultConfig: Config = {
  id: 'id',
  parentId: 'parentId',
  dataField: 'data',
  nodesField: 'children',
}

/**
 * Unflattens an array to a tree with runtime O(n)
 */
export function arrayToTree (items: Item[], config: Partial<Config> = {}): TreeItem[] {
  const conf: Config = { ...defaultConfig, ...config }

  // the resulting unflattened tree
  const rootItems: TreeItem[] = []

  // stores all already processed items with ther ids as key so we can easily look them up
  const lookup: { [id: string]: TreeItem } = {}

  // idea of this loop:
  // whenever an item has a parent, but the parent is not yet in the lookup object, we store a preliminary parent
  // in the lookup object and fill it with the data of the parent later
  // if an item has no parentId, add it as a root element to rootItems
  for (const item of items) {
    const itemId = item[conf.id]
    const parentId = item[conf.parentId]

    // look whether item already exists in the lookup table
    if (!Object.prototype.hasOwnProperty.call(lookup, itemId)) {
      // item is not yet there, so add a preliminary item (its data will be added later)
      lookup[itemId] = { [conf.nodesField]: [] }
    }

    // add the current item's data to the item in the lookup table
    if (conf.dataField) {
      lookup[itemId][conf.dataField] = item
    } else {
      lookup[itemId] = { ...item, [conf.nodesField]: lookup[itemId][conf.nodesField] }
    }

    const TreeItem = lookup[itemId]

    if (parentId === null) {
      // is a root item
      rootItems.push(TreeItem)
    } else {
      // has a parent

      // look whether the parent already exists in the lookup table
      if (!Object.prototype.hasOwnProperty.call(lookup, parentId)) {
        // parent is not yet there, so add a preliminary parent (its data will be added later)
        lookup[parentId] = { [conf.nodesField]: [] }
      }

      // add the current item to the parent
      lookup[parentId][conf.nodesField].push(TreeItem)
    }
  }

  return rootItems
}
