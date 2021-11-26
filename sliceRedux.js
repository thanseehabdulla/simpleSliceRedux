/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from 'utils/@reduxjs/toolkit';
import { useInjectReducer } from 'utils/redux-injectors';
import axios from 'axios';
import URLS from 'utils/api';
import { Notification } from 'utils/notification';
import { IState } from './types';

export const initialState: IState = {
  loading: 'idle',
  datas: [],
  message: '',
};

const slice = createSlice({
  name: 'test',
  initialState,
  reducers: {
    getData(state, action) {
      // Use a "state machine" approach for loading state instead of booleans
      if (state.loading === 'idle') {
        state.loading = 'pending';
      }
    },
    setData(state, action: PayloadAction<any>) {
      if (state.loading === 'pending') {
        state.loading = 'idle';
        state.datas = action.payload;
      }
    },
  },
});

export const { actions: Actions } = slice;

export const useSlice = () => {
  useInjectReducer({ key: slice.name, reducer: slice.reducer });
  return { actions: slice.actions };
};

const { getData, setData } = slice.actions;

export const fetchData = () => async (dispatch) => {
  dispatch(getData({ type: 'get_data' }));

  axios
    .get(URLS['path']['get'])
    .then((response) => {
      // handle success
      dispatch(setData(response.data.body));
    })
    .catch((error) => {
      dispatch(error.message);
    });
};

export const postData = (data) => async (dispatch) => {
  axios
    .post(URLS['path']['post'], data)
    .then(() => {
      // handle success
      dispatch(fetchData());
      Notification('Save', 'Successfully Saved', 'success');
    })
    .catch((error) => {
      if ((error?.message || '').includes('500')) {
        Notification('Failed', 'code exist', 'danger');
      } else {
        Notification('Failed', error?.message, 'danger');
      }
    });
};

export const deleteData = (id) => async (dispatch) => {
  axios
    .delete(`${URLS['path']['post']}/${id}`)
    .then(() => {
      // handle success
      dispatch(fetchData());
      Notification('Delete', 'Successfully Deleted', 'success');
    })
    .catch((error) => {
      Notification('Failed', error?.message, 'danger');
    });
};

export const updateData = (payload) => async (dispatch) => {
  const data = { ...payload };
  if (data?._id) {
    delete data._id;
  }

  axios
    .put(`${URLS['path']['post']}/${data.id}`, data)
    .then(() => {
      // handle success
      dispatch(fetchData());
      Notification('Update', 'Successfully Updated', 'success');
    })
    .catch((error) => {
      Notification('Failed', error?.message, 'danger');
    });
};
