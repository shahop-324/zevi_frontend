/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';
import { alpha, useTheme, styled } from '@mui/material/styles';
import {
  Toolbar,
  Tooltip,
  IconButton,
  Typography,
  Button,
  ButtonGroup,
  Popper,
  MenuItem,
  MenuList,
  Grow,
  ClickAwayListener,
  Portal,
  Paper,
  Stack,
} from '@mui/material';

// ----------------------------------------------------------------------
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
// components
import { EditRounded } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import CsvDownload from 'react-json-to-csv';
import Iconify from '../../../../components/Iconify';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha('#9C9C9C', 0.15),
  '&:hover': {
    backgroundColor: alpha('#9C9C9C', 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

// ----------------------------------------------------------------------

const RootStyle = styled(Toolbar)(({ theme }) => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
}));

// ----------------------------------------------------------------------

ProductListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  onDeleteProducts: PropTypes.func,
};

const options = ['Add Product', 'Import using Excel'];

const allowed = [
  'productName',
  'brand',
  'price',
  'discountedPrice',
  'coins',
  'wholesalePrice',
  'isFragile',
  'weight',
  'productSKU',
  'length',
  'width',
  'height',
  'minQuantitySold',
  'minWholesaleQuantity',
  'quantityInStock',
  'metaTitle',
  'metaKeywords',
  'metaDescription',
];

export default function ProductListToolbar({
  numSelected,
  openBulkImport,
  onDeleteProducts,
  openAddProduct,
  setTerm,
  products,
  handleOpenBulkUpdate,
}) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const { store } = useSelector((state) => state.store);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
    switch (selectedIndex * 1) {
      case 0:
        // Add product
        openAddProduct();
        break;

      case 1:
        // Bluk import
        openBulkImport();
        break;

      default:
        break;
    }
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <RootStyle
      sx={{
        ...(numSelected > 0 && {
          color: isLight ? 'primary.main' : 'text.primary',
          bgcolor: isLight ? 'primary.lighter' : 'primary.dark',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
            onChange={(e) => setTerm(e.target.value)}
          />
        </Search>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteProducts}>
            <Iconify icon={'eva:trash-2-outline'} />
          </IconButton>
        </Tooltip>
      ) : (
        <Stack direction="row" alignItems="center" spacing={2}>
          <div className="d-flex flex-row align-items-center justify-content-end">
            <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button">
              <Button onClick={handleClick}>{options[selectedIndex]}</Button>
              <Button
                size="small"
                aria-controls={open ? 'split-button-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-label="select merge strategy"
                aria-haspopup="menu"
                onClick={handleToggle}
              >
                <ArrowDropDownRoundedIcon />
              </Button>
            </ButtonGroup>
            <Portal>
              <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList id="split-button-menu">
                          {options.map((option, index) => (
                            <MenuItem
                              key={option}
                              selected={index === selectedIndex}
                              onClick={(event) => handleMenuItemClick(event, index)}
                            >
                              <Typography variant="subtitle2">{option}</Typography>
                            </MenuItem>
                          ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Portal>
          </div>
          <Button
            onClick={() => {
              handleOpenBulkUpdate();
            }}
            startIcon={<EditRounded />}
            variant="outlined"
          >
            Bulk Update
          </Button>
          <CsvDownload
            data={products.map((el) =>
              Object.keys(el)
                .filter((key) => allowed.includes(key))
                .reduce((obj, key) => {
                  obj[key] = el[key];
                  return obj;
                }, {})
            )}
            filename={`products_list_${store.storeName}.csv`}
            style={{
              boxShadow: 'inset 0px 1px 0px 0px #00AB55',
              background: 'linear-gradient(to bottom, #00AB55 5%, #13C06A 100%)',
              backgroundColor: '#08BD62',
              borderRadius: '6px',
              border: '1px solid #00AB55',
              display: 'inline-block',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 'bold',
              padding: '6px 24px',
              textDecoration: 'none',
              textShadow: '0px 1px 0px #0C8F4D',
            }}
          >
            Export
          </CsvDownload>
        </Stack>
      )}
    </RootStyle>
  );
}
