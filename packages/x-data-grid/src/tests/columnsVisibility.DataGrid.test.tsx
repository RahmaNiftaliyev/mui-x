import * as React from 'react';
import { spy } from 'sinon';
import { createRenderer, fireEvent, screen, waitFor, within } from '@mui/internal-test-utils';
import {
  DataGrid,
  DataGridProps,
  GridRowsProp,
  GridColDef,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { getColumnHeadersTextContent, grid } from 'test/utils/helperFn';

const isJSDOM = /jsdom/.test(window.navigator.userAgent);

const rows: GridRowsProp = [{ id: 1, idBis: 1 }];

const columns: GridColDef[] = [{ field: 'id' }, { field: 'idBis' }];

describe('<DataGrid /> - Columns visibility', () => {
  const { render } = createRenderer();

  function TestDataGrid(
    props: Omit<DataGridProps, 'columns' | 'rows'> &
      Partial<Pick<DataGridProps, 'rows' | 'columns'>>,
  ) {
    return (
      <div style={{ width: 300, height: 300 }}>
        <DataGrid columns={columns} rows={rows} {...props} autoHeight={isJSDOM} />
      </div>
    );
  }

  describe('prop: columnVisibilityModel and onColumnVisibilityModelChange', () => {
    it('should allow to set the columnVisibilityModel prop', () => {
      render(<TestDataGrid columnVisibilityModel={{ idBis: false }} />);

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    });

    it('should allow to update the columnVisibilityModel prop from the outside', () => {
      const { setProps } = render(<TestDataGrid columnVisibilityModel={{ idBis: false }} />);

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);

      setProps({
        columnVisibilityModel: {},
      });
      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    });

    it('should update the visible columns when props.onColumnVisibilityModelChange and props.columnVisibilityModel are not defined', async () => {
      const { user } = render(<TestDataGrid showToolbar />);

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
      await user.click(screen.getByRole('button', { name: 'Columns' }));
      await user.click(screen.getByRole('checkbox', { name: 'id' }));
      expect(getColumnHeadersTextContent()).to.deep.equal(['idBis']);
    });

    it('should call onColumnVisibilityModelChange and update the visible columns when props.columnVisibilityModel is not defined', async () => {
      const onColumnVisibilityModelChange = spy();
      const { user } = render(
        <TestDataGrid showToolbar onColumnVisibilityModelChange={onColumnVisibilityModelChange} />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
      await user.click(screen.getByRole('button', { name: 'Columns' }));
      await user.click(screen.getByRole('checkbox', { name: 'id' }));
      expect(getColumnHeadersTextContent()).to.deep.equal(['idBis']);
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        id: false,
      });
    });

    it('should call onColumnVisibilityModelChange with the new model when columnVisibilityModel is controlled', () => {
      const onColumnVisibilityModelChange = spy();
      render(
        <TestDataGrid
          showToolbar
          columnVisibilityModel={{ idBis: false }}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
      fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
      fireEvent.click(screen.getByRole('checkbox', { name: 'id' }));
      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        id: false,
        idBis: false,
      });
    });

    it('should call onColumnVisibilityModelChange with the new model when toggling all columns', async () => {
      const onColumnVisibilityModelChange = spy();
      function ControlledTest() {
        const [model, setModel] = React.useState<GridColumnVisibilityModel>({ idBis: false });
        return (
          <TestDataGrid
            showToolbar
            columnVisibilityModel={model}
            onColumnVisibilityModelChange={(newModel) => {
              onColumnVisibilityModelChange(newModel);
              setModel(newModel);
            }}
          />
        );
      }
      const { user } = render(<ControlledTest />);

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);

      await user.click(screen.getByRole('button', { name: 'Columns' }));
      const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });

      // Hide all
      await user.click(showHideAllCheckbox);
      expect(onColumnVisibilityModelChange.callCount).to.equal(1);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({});

      // Show all
      await user.click(showHideAllCheckbox);
      expect(onColumnVisibilityModelChange.callCount).to.equal(2);
      expect(onColumnVisibilityModelChange.lastCall.firstArg).to.deep.equal({
        id: false,
        idBis: false,
      });
    });

    // Fixes (1) and (2) in https://github.com/mui/mui-x/issues/7393#issuecomment-1372129661
    it('should not show hidden non hideable columns when "Show/Hide All" is clicked', async () => {
      const { user } = render(
        <TestDataGrid
          showToolbar
          columns={[{ field: 'id' }, { field: 'idBis', hideable: false }]}
          initialState={{
            columns: {
              columnVisibilityModel: { idBis: false },
            },
          }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Columns' }));
      const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });
      // Hide all
      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal([]);
      // Show all
      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    });
  });

  describe('prop: initialState.columns.columnVisibilityModel', () => {
    it('should allow to initialize the columnVisibilityModel', () => {
      render(
        <TestDataGrid
          initialState={{
            columns: {
              columnVisibilityModel: { idBis: false },
            },
          }}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    });

    it('should use the control state upon the initialize state when both are defined', () => {
      render(
        <TestDataGrid
          columnVisibilityModel={{}}
          initialState={{
            columns: {
              columnVisibilityModel: { idBis: false },
            },
          }}
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    });

    it('should not update the visible columns when updating the initial state', () => {
      const { setProps } = render(
        <TestDataGrid
          initialState={{
            columns: {
              columnVisibilityModel: { idBis: false },
            },
          }}
        />,
      );

      setProps({
        initialState: {
          columns: {
            columnVisibilityModel: {},
          },
        },
      });

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    });

    it('should allow to update the visible columns through the UI when initialized with initialState', async () => {
      const { user } = render(
        <TestDataGrid
          initialState={{
            columns: {
              columnVisibilityModel: { idBis: false },
            },
          }}
          showToolbar
        />,
      );

      expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
      await user.click(screen.getByRole('button', { name: 'Columns' }));
      await user.click(screen.getByRole('checkbox', { name: 'id' }));
      expect(getColumnHeadersTextContent()).to.deep.equal([]);
    });
  });

  it('should autofocus the first switch element in columns management when `autoFocusSearchField` disabled', async () => {
    const { user } = render(
      <TestDataGrid
        showToolbar
        slotProps={{
          columnsManagement: {
            autoFocusSearchField: false,
          },
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(screen.getByRole('checkbox', { name: columns[0].field })).toHaveFocus();
  });

  it('should hide `Show/Hide all` in columns management when `disableShowHideToggle` is `true`', async () => {
    const { setProps, user } = render(<TestDataGrid showToolbar />);

    await user.click(screen.getByRole('button', { name: 'Columns' }));
    // check if `Show/Hide all` checkbox is present initially
    expect(screen.getByRole('checkbox', { name: 'Show/Hide All' })).not.to.equal(null);
    setProps({
      slotProps: {
        columnsManagement: {
          disableShowHideToggle: true,
        },
      },
    });

    // check if `Show/Hide All` checkbox is not present  after setting `slotProps`
    expect(screen.queryByRole('checkbox', { name: 'Show/Hide All' })).to.equal(null);
  });

  it('should hide `Reset` in columns panel when `disableResetButton` is `true`', async () => {
    const { setProps, user } = render(<TestDataGrid showToolbar />);

    await user.click(screen.getByRole('button', { name: 'Columns' }));
    // check if Reset button is present initially
    expect(screen.getByRole('button', { name: 'Reset' })).not.to.equal(null);
    setProps({
      slotProps: {
        columnsManagement: {
          disableResetButton: true,
        },
      },
    });
    // check if Reset button is not present after setting slotProps
    expect(screen.queryByRole('button', { name: 'Reset' })).to.equal(null);
  });

  it('should reset the columns to initial columns state when `Reset` button is clicked in columns management panel', async () => {
    const { user } = render(<TestDataGrid showToolbar />);

    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).to.have.attribute('disabled');

    // Hide `idBis` column
    await user.click(screen.getByRole('checkbox', { name: 'idBis' }));
    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    expect(resetButton).not.to.have.attribute('disabled');

    // Reset columns
    await user.click(resetButton);
    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    expect(resetButton).to.have.attribute('disabled');
  });

  it('should use the initial column visibility model as a reference when `Reset` button is clicked in columns management panel', async () => {
    const { user } = render(
      <TestDataGrid
        showToolbar
        initialState={{
          columns: {
            columnVisibilityModel: { idBis: false },
          },
        }}
      />,
    );

    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).to.have.attribute('disabled');

    // Show `idBis` column
    await user.click(screen.getByRole('checkbox', { name: 'idBis' }));
    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    expect(resetButton).not.to.have.attribute('disabled');

    // Close columns management
    await user.click(screen.getByRole('button', { name: 'Columns' }));

    // Reopen columns management
    await user.click(screen.getByRole('button', { name: 'Columns' }));

    const resetButton1 = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton1).not.to.have.attribute('disabled');

    // Reset columns
    await user.click(resetButton1);
    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    expect(resetButton1).to.have.attribute('disabled');
  });

  it('should use the first controlled column visibility model as a reference when `Reset` button is clicked in columns management panel', async () => {
    function ControlledTest() {
      const [model, setModel] = React.useState<GridColumnVisibilityModel>({ idBis: false });
      return (
        <TestDataGrid
          showToolbar
          columnVisibilityModel={model}
          onColumnVisibilityModelChange={setModel}
        />
      );
    }
    const { user } = render(<ControlledTest />);

    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).to.have.attribute('disabled');

    // Show `idBis` column
    await user.click(screen.getByRole('checkbox', { name: 'idBis' }));
    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    expect(resetButton).not.to.have.attribute('disabled');

    // Close columns management
    await user.click(screen.getByRole('button', { name: 'Columns' }));

    // Reopen columns management
    await user.click(screen.getByRole('button', { name: 'Columns' }));

    const resetButton1 = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton1).not.to.have.attribute('disabled');

    // Reset columns
    await user.click(resetButton1);
    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    expect(resetButton1).to.have.attribute('disabled');
  });

  it('should update the initial column visibility model when the columns are updated', async () => {
    const { user, setProps } = render(
      <TestDataGrid
        showToolbar
        initialState={{
          columns: {
            columnVisibilityModel: { idBis: false },
          },
        }}
      />,
    );

    expect(getColumnHeadersTextContent()).to.deep.equal(['id']);
    await user.click(screen.getByRole('button', { name: 'Columns' }));
    const resetButton = screen.getByRole('button', { name: 'Reset' });
    expect(resetButton).to.have.attribute('disabled');

    // Show `idBis` column
    await user.click(screen.getByRole('checkbox', { name: 'idBis' }));
    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    expect(resetButton).not.to.have.attribute('disabled');

    // Reset columns
    setProps({
      columns: [{ field: 'id' }, { field: 'idBis' }],
    });

    expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    // Reference updated to the current `columnVisibilityModel`
    expect(resetButton).to.have.attribute('disabled');
  });

  describe('prop: `getTogglableColumns`', () => {
    it('should control columns shown in columns panel using `getTogglableColumns` prop', () => {
      const getTogglableColumns = (cols: GridColDef[]) =>
        cols.filter((column) => column.field !== 'idBis').map((column) => column.field);
      render(
        <TestDataGrid
          showToolbar
          slotProps={{
            columnsManagement: {
              getTogglableColumns,
            },
          }}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
      expect(screen.queryByRole('checkbox', { name: 'id' })).not.to.equal(null);
      expect(screen.queryByRole('checkbox', { name: 'idBis' })).to.equal(null);
    });

    it('should avoid toggling columns provided by `getTogglableColumns` prop on `Show/Hide All`', async () => {
      const getTogglableColumns = (cols: GridColDef[]) =>
        cols.filter((column) => column.field !== 'idBis').map((column) => column.field);
      const { user } = render(
        <TestDataGrid
          showToolbar
          slotProps={{
            columnsManagement: {
              getTogglableColumns,
            },
          }}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Columns' }));
      const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });
      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal(['idBis']);

      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'idBis']);
    });
  });

  describe('prop: toggleAllMode', () => {
    it('should toggle filtered columns when `toggleAllMode` is `filtered`', async () => {
      const { user } = render(
        <div style={{ width: 400, height: 300 }}>
          <DataGrid
            columns={[
              { field: 'id' },
              { field: 'firstName' },
              { field: 'lastName' },
              { field: 'age' },
            ]}
            rows={[{ id: 1, firstName: 'John', lastName: 'Doe', age: 20 }]}
            slotProps={{
              columnsManagement: {
                toggleAllMode: 'filteredOnly',
              },
            }}
            showToolbar
            disableVirtualization
          />
        </div>,
      );

      function getColumnsCheckboxesNames() {
        return within(grid('columnsManagement')!)
          .getAllByRole('checkbox')
          .map((item) => item.getAttribute('name'));
      }

      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'firstName', 'lastName', 'age']);
      const button = screen.getByRole('button', { name: 'Columns' });
      await user.click(button);

      const input = screen.getByPlaceholderText('Search');
      await user.type(input, 'name');
      await waitFor(() => {
        expect(getColumnsCheckboxesNames()).to.deep.equal(['firstName', 'lastName']);
      });

      const showHideAllCheckbox = screen.getByRole('checkbox', { name: 'Show/Hide All' });
      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'age']);

      // clear the search before the new search
      await user.clear(input);
      await user.type(input, 'firstName');
      await waitFor(() => {
        expect(getColumnsCheckboxesNames()).to.deep.equal(['firstName']);
      });

      await user.click(showHideAllCheckbox);
      expect(getColumnHeadersTextContent()).to.deep.equal(['id', 'firstName', 'age']);
    });
  });
});
