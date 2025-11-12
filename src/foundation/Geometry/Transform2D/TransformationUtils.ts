/* depricated do not use! Use Transform2D, Pose2D and TransformProjection instead */


//@ts-expect-error: no type declaration
import MatrixJs from "matrix-js";

import type { HomogeneousPoint, Point, TransformationMatrix } from "../types";
import { HOMOGENEOUS_Z, HomogeneousUtils, MATRIX_DIMENSION } from "./HomogeneousUtils";

export function copyMatrix(transformationMatrix: TransformationMatrix): TransformationMatrix {
  const matrixCopy: TransformationMatrix = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < MATRIX_DIMENSION; i++) {
    for (let j = 0; j < MATRIX_DIMENSION; j++) {
      matrixCopy[i][j] = transformationMatrix[i][j];
    }
  }
  return matrixCopy;
}

export function formTransformationMatrix(tx: number, ty: number, sx = 1, sy = 1): TransformationMatrix {
  return [
    [sx, 0, tx],
    [0, sy, ty],
    [0, 0, HOMOGENEOUS_Z],
  ];
}

export function scaleRelativeToAuxiliaryOrigin(objectTranslationMatrix: TransformationMatrix, objectScaleMatrix: TransformationMatrix, auxiliaryOrigin: Point, scaleMatrix: TransformationMatrix): { updatedObjectTranslationMatrix: TransformationMatrix; updatedObjectScaleMatrix: TransformationMatrix } {
  //TODO: think about store several transform maitrces in object instead of objectOrigin and objectScale
  const auxiliaryToWorldMatrix = formTransformationMatrix(auxiliaryOrigin.x, auxiliaryOrigin.y);
  const worldToAuxiliaryMatrix = MatrixJs(auxiliaryToWorldMatrix).inv();

  const objectToAuxiliaryBasis = MatrixJs(worldToAuxiliaryMatrix).prod(MatrixJs(objectTranslationMatrix));

  const objectToAuxiliaryBasisWithScale = MatrixJs(scaleMatrix).prod(MatrixJs(objectToAuxiliaryBasis));
  const objectToAuxiliaryBasisWithScaleOnlyTransform = formTransformationMatrix(objectToAuxiliaryBasisWithScale[0][2], objectToAuxiliaryBasisWithScale[1][2]);

  const updatedObjectTranslationMatrix = MatrixJs(auxiliaryToWorldMatrix).prod(MatrixJs(objectToAuxiliaryBasisWithScaleOnlyTransform));

  const updatedObjectScaleMatrix: TransformationMatrix = MatrixJs(objectScaleMatrix).mul(MatrixJs(scaleMatrix));
  return { updatedObjectTranslationMatrix, updatedObjectScaleMatrix };
}

