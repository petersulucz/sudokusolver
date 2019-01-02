class Sudoku {
    constructor(dimension, table, cells) {
        this.dimension = dimension;
        this.table = table;
        this.cells = cells;
    }
    GetCells() {
        let result = new Array();
        for (let r = 0; r < this.dimension; r++) {
            result.push(new Array());
            for (let c = 0; c < this.dimension; c++) {
                let parsedValue = Number.parseInt(this.cells[r][c].value);
                if (parsedValue === Number.NaN || Number.isNaN(parsedValue)) {
                    parsedValue = null;
                }
                result[r].push(parsedValue);
            }
        }
        return result;
    }
    UpdateCells(values) {
        for (let r = 0; r < this.dimension; r++) {
            for (let c = 0; c < this.dimension; c++) {
                if (values[r][c] !== null) {
                    this.cells[r][c].value = values[r][c] + "";
                }
            }
        }
    }
    Iterate(func) {
        for (let r = 0; r < this.dimension; r++) {
            for (let c = 0; c < this.dimension; c++) {
                func(r, c);
            }
        }
    }
    static Create(parent, dimension) {
        let table = document.createElement('table');
        let cells = new Array();
        if (dimension / 3 !== Math.floor(dimension / 3)) {
            throw "The dimension must be divisible by 3.";
        }
        let tbody = table.createTBody();
        for (let r = 0; r < dimension; r++) {
            let rowCells = new Array();
            let row = tbody.insertRow();
            for (let c = 0; c < dimension; c++) {
                let cell = row.insertCell();
                let input = document.createElement('input');
                cell.appendChild(input);
                rowCells.push(input);
            }
            cells.push(rowCells);
        }
        parent.appendChild(table);
        return new Sudoku(dimension, table, cells);
    }
}
class CellDetails {
    constructor(conflictingValues, row, col) {
        this.conflictingValues = conflictingValues;
        this.value = null;
        this.row = row;
        this.col = col;
    }
    get Value() {
        return this.value;
    }
    IsPossible(value) {
        return this.conflictingValues[value] === 0;
    }
    RemovePossibility(value) {
        this.conflictingValues[value]++;
    }
    AddPossibility(value) {
        this.conflictingValues[value]--;
    }
    SetValue(value) {
        if (false === this.IsPossible(value)) {
            throw `The value ${value} is not possible in the cell ${this.row},${this.col}`;
        }
        this.value = value;
    }
    ClearValue() {
        this.value = null;
    }
}
class Solver {
    constructor(dimension, currentCells) {
        this.dimension = dimension;
        this.cellDetails = this.GenerateCellDetails();
        this.InitializeCells(currentCells);
    }
    GenerateCellDetails() {
        let result = new Array();
        for (let r = 0; r < this.dimension; r++) {
            result.push(new Array());
            for (let c = 0; c < this.dimension; c++) {
                let deets = new CellDetails(new Array(this.dimension + 1).fill(0, 1, this.dimension + 1), r, c);
                result[r].push(deets);
            }
        }
        return result;
    }
    InitializeCells(currentCells) {
        for (let r = 0; r < this.dimension; r++) {
            for (let c = 0; c < this.dimension; c++) {
                if (currentCells[r][c] !== null) {
                    this.SetCell(r, c, currentCells[r][c], false);
                }
            }
        }
    }
    ForceCell(row, col, value) {
        this.SetCell(row, col, value, false);
    }
    SetCell(row, col, value, clear) {
        let cell = this.cellDetails[row][col];
        if (clear) {
            cell.ClearValue();
        }
        else {
            cell.SetValue(value);
        }
        // Update the row
        for (let r = 0; r < this.dimension; r++) {
            if (clear) {
                this.cellDetails[r][col].AddPossibility(value);
            }
            else {
                this.cellDetails[r][col].RemovePossibility(value);
            }
        }
        // Update the column
        for (let c = 0; c < this.dimension; c++) {
            if (clear) {
                this.cellDetails[row][c].AddPossibility(value);
            }
            else {
                this.cellDetails[row][c].RemovePossibility(value);
            }
        }
        // Get the quadtrant
        let quadtrantDimension = this.dimension / 3;
        let rStart = Math.floor(row / quadtrantDimension) * quadtrantDimension;
        let cStart = Math.floor(col / quadtrantDimension) * quadtrantDimension;
        for (let r = rStart; r < rStart + quadtrantDimension; r++) {
            for (let c = cStart; c < cStart + quadtrantDimension; c++) {
                if (clear) {
                    this.cellDetails[r][c].AddPossibility(value);
                }
                else {
                    this.cellDetails[r][c].RemovePossibility(value);
                }
            }
        }
    }
    SolveBruteForce() {
        this.SolveBruteForce_impl(0, 0);
    }
    SolveBruteForce_impl(r, c) {
        if (r === this.dimension) {
            return true;
        }
        let total = r * this.dimension + c + 1;
        let nextR = Math.floor(total / this.dimension);
        let nextC = Math.floor(total % this.dimension);
        let cell = this.cellDetails[r][c];
        if (cell.Value === null) {
            for (let val = 1; val <= this.dimension; val++) {
                if (cell.IsPossible(val)) {
                    this.SetCell(r, c, val, false);
                    if (this.SolveBruteForce_impl(nextR, nextC)) {
                        return true;
                    }
                    this.SetCell(r, c, val, true);
                }
            }
            return false;
        }
        return this.SolveBruteForce_impl(nextR, nextC);
    }
    GetCells() {
        let result = new Array();
        for (let r = 0; r < this.dimension; r++) {
            result.push(new Array());
            for (let c = 0; c < this.dimension; c++) {
                let value = result[r].push(this.cellDetails[r][c].Value);
            }
        }
        return result;
    }
}
let parentElement = document.currentScript.parentElement;
var sudoku = Sudoku.Create(parentElement, 9);
let solver = new Solver(9, sudoku.GetCells());
//solver.ForceCell(0, 0, 2);
//solver.ForceCell(0, 2, 4);
//
//solver.ForceCell(0, 3, 1);
//solver.ForceCell(1, 3, 5);
//solver.ForceCell(2, 3, 9);
//solver.ForceCell(1, 5, 3);
//
//solver.ForceCell(1, 6, 6);
//solver.ForceCell(1, 8, 7);
//solver.ForceCell(2, 6, 4);
//
//solver.ForceCell(3, 0, 9);
//solver.ForceCell(4, 0, 6);
//solver.ForceCell(4, 1, 5);
//solver.ForceCell(5, 1, 2);
//
//solver.ForceCell(3, 3, 4);
//solver.ForceCell(4, 4, 1);
//solver.ForceCell(5, 5, 8);
//
//solver.ForceCell(3, 7, 1);
//solver.ForceCell(4, 7, 7);
//solver.ForceCell(4, 8, 4);
//solver.ForceCell(5, 8, 9);
//
//solver.ForceCell(6, 2, 9);
//solver.ForceCell(7, 0, 5);
//solver.ForceCell(7, 2, 2);
//
//solver.ForceCell(6, 5, 5);
//solver.ForceCell(7, 3, 3);
//solver.ForceCell(7, 5, 1);
//solver.ForceCell(8, 5, 4);
//
//solver.ForceCell(8, 6, 1);
//solver.ForceCell(8, 8, 2);
sudoku.UpdateCells(solver.GetCells());
//solver.SolveBruteForce();
//sudoku.UpdateCells(solver.GetCells());
