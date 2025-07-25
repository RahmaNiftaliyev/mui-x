import { DefaultizedProps } from '@mui/x-internals/types';
import {
  PickerSelectionState,
  PickerViewRenderer,
  TimeViewWithMeridiem,
  BaseClockProps,
  PickerRangeValue,
  PickerViewsRendererProps,
} from '@mui/x-date-pickers/internals';
import { PickerValidDate } from '@mui/x-date-pickers/models';
import { usePickerAdapter } from '@mui/x-date-pickers/hooks';
import { isRangeValid } from '../internals/utils/date-utils';
import { calculateRangeChange, resolveReferenceDate } from '../internals/utils/date-range-manager';
import { usePickerRangePositionContext } from '../hooks';

export type DateTimeRangePickerTimeWrapperProps<
  TComponentProps extends DefaultizedProps<
    Omit<BaseClockProps<TimeViewWithMeridiem>, 'value' | 'defaultValue' | 'onChange'>,
    'views'
  >,
> = Omit<
  TComponentProps,
  'views' | 'view' | 'onViewChange' | 'value' | 'defaultValue' | 'onChange'
> & {
  view: TimeViewWithMeridiem;
  onViewChange?: (view: TimeViewWithMeridiem) => void;
  views: readonly TimeViewWithMeridiem[];
  value?: PickerRangeValue;
  defaultValue?: PickerRangeValue;
  onChange?: (
    value: PickerRangeValue,
    selectionState: PickerSelectionState,
    selectedView: TimeViewWithMeridiem,
  ) => void;
  viewRenderer?: PickerViewRenderer<PickerRangeValue, TComponentProps> | null;
  openTo?: TimeViewWithMeridiem;
};

/**
 * @ignore - internal component.
 */
function DateTimeRangePickerTimeWrapper<
  TComponentProps extends DefaultizedProps<
    Omit<BaseClockProps<TimeViewWithMeridiem>, 'value' | 'defaultValue' | 'onChange'>,
    'views'
  >,
>(props: DateTimeRangePickerTimeWrapperProps<TComponentProps>) {
  const adapter = usePickerAdapter();

  const {
    viewRenderer,
    value,
    onChange,
    defaultValue,
    onViewChange,
    views,
    className,
    referenceDate: referenceDateProp,
    ...other
  } = props;

  const { rangePosition } = usePickerRangePositionContext();

  if (!viewRenderer) {
    return null;
  }

  const currentValue = (rangePosition === 'start' ? value?.[0] : value?.[1]) ?? null;
  const currentDefaultValue =
    (rangePosition === 'start' ? defaultValue?.[0] : defaultValue?.[1]) ?? null;
  const referenceDate = resolveReferenceDate(referenceDateProp, rangePosition);
  const handleOnChange = (
    newDate: PickerValidDate | null,
    selectionState: PickerSelectionState,
    selectedView: TimeViewWithMeridiem,
  ) => {
    if (!onChange || !value) {
      return;
    }
    const { newRange } = calculateRangeChange({
      newDate,
      adapter,
      range: value,
      rangePosition,
    });
    const isFullRangeSelected = rangePosition === 'end' && isRangeValid(adapter, newRange);
    onChange(newRange, isFullRangeSelected ? 'finish' : 'partial', selectedView);
  };

  return viewRenderer({
    ...other,
    referenceDate,
    views,
    onViewChange,
    value: currentValue,
    onChange: handleOnChange,
    defaultValue: currentDefaultValue,
  } as any as PickerViewsRendererProps<PickerRangeValue, TimeViewWithMeridiem, TComponentProps>);
}

export { DateTimeRangePickerTimeWrapper };
