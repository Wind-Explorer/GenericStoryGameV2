/**
 * Takes an absolute path to an object and returns the name of the object
 * @param path Absolute path to a file / direcotry
 * @returns string The name of the file / direcotry
 */
export function getObjFromPath(path: string): string {
  const pathArray = path.split('/');
  return pathArray[pathArray.length - 1];
}