"use client";

import * as React from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import { visuallyHidden } from "@mui/utils";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import { typography } from "@/style/style";

const headCells = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Name",
  },
  {
    id: "results.0.username",
    numeric: true,
    disablePadding: false,
    label: "Winner",
  },
  {
    id: "startsAt",
    numeric: true,
    disablePadding: false,
    label: "Date",
  },
  {
    id: "nbPlayers",
    numeric: true,
    disablePadding: false,
    label: "No. of players",
  },
  {
    id: "nbRounds",
    numeric: true,
    disablePadding: false,
    label: "No. of rounds",
  },

  {
    id: "clock",
    numeric: true,
    disablePadding: false,
    label: "Time Control",
  },
];

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ alignContent: "space-around" }}>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              sx={{ fontWeight: "bold" }}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
};

function EnhancedTableToolbar({ changeTimeFilter }) {
  return (
    <Toolbar className="h-28">
      <div className={"flex-1" + typography.headerBig}>Tournaments</div>

      {/*  <FormControl>
        <RadioGroup
          sx={{ padding: "1rem 0" }}
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="allTime"
          name="radio-buttons-group"
          row
          onChange={changeTimeFilter}
        >
          <FormControlLabel
            value="allTime"
            control={<Radio />}
            label="All Time"
            labelPlacement={"top"}
          />
          <FormControlLabel
            value="monthly"
            control={<Radio />}
            label="Monthly"
            labelPlacement={"top"}
          />
          <FormControlLabel
            value="weekly"
            control={<Radio />}
            label="Weekly"
            labelPlacement={"top"}
          />
        </RadioGroup>
      </FormControl> */}
    </Toolbar>
  );
}

const getTournamentLength = async () => {
  const res = await fetch(`/api/tournament/length`);
  const data = await res.json();
  return data;
};

export default function TournamentTable() {
  const [count, setCount] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let data = await getTournamentLength();
        if (data.hasOwnProperty("error")) {
          setCount(Number(100));
        } else {
          setCount(Number(data));
        }
      } catch (error) {
        setCount(Number(100)); // Set a default count in case of an error
      }
    };

    fetchData();
  }, []);

  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("startsAt");
  const [page, setPage] = React.useState(0);
  const [timeFilter, setTimeFilter] = React.useState("allTime");
  const rowsPerPage = 10;

  const [visibleRows, setVisibleRows] = React.useState(
    new Array(rowsPerPage).fill(null)
  );

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - count.length) : 0;

  const changeTimeFilter = (event) => {
    setTimeFilter(event.target.defaultValue);
  };

  React.useEffect(() => {
    setVisibleRows(new Array(rowsPerPage).fill(null));
    //Prepare request
    const baseUrl = `/api/tournament/search`;
    const queryParams = new URLSearchParams();
    queryParams.append("rowsPerPage", rowsPerPage);
    queryParams.append("page", page);
    queryParams.append("timeFilter", timeFilter);
    queryParams.append("order", order == "asc" ? "desc" : "asc");
    queryParams.append("orderBy", orderBy);

    const url = `${baseUrl}?${queryParams.toString()}`;

    //Get Data

    const getData = async () => {
      const res = await fetch(url);
      const data = await res.json();

      if (data.hasOwnProperty("error")) {
        setVisibleRows(new Array(rowsPerPage).fill(null));
      } else {
        setVisibleRows(data);
      }
    };

    getData();

    return;
  }, [order, orderBy, rowsPerPage, page, timeFilter]);

  return (
    <Box className="w-full max-lg:w-[990px] ">
      <div
        className="w-full mb-2 bg-white rounded-md
border-gray-950 border"
      >
        <EnhancedTableToolbar changeTimeFilter={changeTimeFilter} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const labelId = `enhanced-table-checkbox-${index}`;

                if (!row) {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={index}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="normal"
                      >
                        ...
                      </TableCell>
                      <TableCell align="right">...</TableCell>
                      <TableCell align="right">...</TableCell>
                      <TableCell align="right">...</TableCell>
                      <TableCell align="right">...</TableCell>
                      <TableCell align="right">...</TableCell>
                    </TableRow>
                  );
                } else {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={index}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="normal"
                      >
                        {row.name}
                      </TableCell>
                      <TableCell align="right">
                        {row.results[0].username}
                      </TableCell>
                      <TableCell align="right">
                        {row.startsAt.slice(0, 10)}
                      </TableCell>
                      <TableCell align="right">{row.nbPlayers}</TableCell>
                      <TableCell align="right">{row.nbRounds}</TableCell>
                      <TableCell align="right">
                        {row.clock.limit % 60 == 0
                          ? `${row.clock.limit / 60}+${row.clock.increment}`
                          : `${row.clock.limit}+${row.clock.increment}`}
                      </TableCell>
                    </TableRow>
                  );
                }
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={count || 100}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
          page={page}
          onPageChange={handleChangePage}
        />
      </div>
    </Box>
  );
}
