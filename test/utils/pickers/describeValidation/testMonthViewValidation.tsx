import * as React from 'react';
import { screen } from '@mui/internal-test-utils';
import { adapterToUse } from 'test/utils/pickers';
import { SinonFakeTimers, useFakeTimers } from 'sinon';
import { DescribeValidationTestSuite } from './describeValidation.types';

export const testMonthViewValidation: DescribeValidationTestSuite = (ElementToTest, getOptions) => {
  const { views, componentFamily, render } = getOptions();

  describe.skipIf(componentFamily === 'field' || !views.includes('month'))('month view:', () => {
    const defaultProps = {
      onChange: () => {},
      ...(views.length > 1 && {
        views: ['month'],
        view: 'month',
        openTo: 'month',
      }),
      ...(componentFamily !== 'calendar' && {
        open: true,
        reduceAnimations: true,
        slotProps: { toolbar: { hidden: true } },
      }),
    };

    it('should apply shouldDisableMonth', () => {
      render(
        <ElementToTest
          {...defaultProps}
          value={null}
          shouldDisableMonth={(date: any) => adapterToUse.getMonth(date) === 3}
        />,
      );

      expect(screen.getByText('Apr')).to.have.attribute('disabled');
      expect(screen.getByText('Jan')).not.to.have.attribute('disabled');
      expect(screen.getByText('May')).not.to.have.attribute('disabled');
    });

    describe('with fake timers', () => {
      // TODO: temporary for vitest. Can move to `vi.useFakeTimers`
      let timer: SinonFakeTimers | null = null;
      beforeEach(() => {
        timer = useFakeTimers({ now: new Date(2018, 0, 1), toFake: ['Date'] });
      });
      afterEach(() => {
        timer?.restore();
      });

      it('should apply disablePast', () => {
        const now = adapterToUse.date();
        function WithFakeTimer(props: any) {
          return <ElementToTest value={now} {...props} />;
        }
        const { setProps } = render(<WithFakeTimer {...defaultProps} disablePast />);

        const nextMonth = adapterToUse.addMonths(now, 1);
        const prevMonth = adapterToUse.addMonths(now, -1);

        expect(screen.getByText(adapterToUse.format(now, 'monthShort'))).not.to.have.attribute(
          'disabled',
        );

        if (!adapterToUse.isSameYear(now, nextMonth)) {
          setProps({ value: nextMonth });
        }
        expect(
          screen.getByText(adapterToUse.format(nextMonth, 'monthShort')),
        ).not.to.have.attribute('disabled');

        if (!adapterToUse.isSameYear(prevMonth, nextMonth)) {
          setProps({ value: prevMonth });
        }
        expect(screen.getByText(adapterToUse.format(prevMonth, 'monthShort'))).to.have.attribute(
          'disabled',
        );

        // TODO: define what appends when value is `null`
      });

      it('should apply disableFuture', () => {
        const now = adapterToUse.date();
        function WithFakeTimer(props: any) {
          return <ElementToTest value={now} {...props} />;
        }
        const { setProps } = render(<WithFakeTimer {...defaultProps} disableFuture />);

        const nextMonth = adapterToUse.addMonths(now, 1);
        const prevMonth = adapterToUse.addMonths(now, -1);

        expect(screen.getByText(adapterToUse.format(now, 'monthShort'))).not.to.have.attribute(
          'disabled',
        );

        if (!adapterToUse.isSameYear(now, nextMonth)) {
          setProps({ value: nextMonth });
        }
        expect(screen.getByText(adapterToUse.format(nextMonth, 'monthShort'))).to.have.attribute(
          'disabled',
        );

        if (!adapterToUse.isSameYear(prevMonth, nextMonth)) {
          setProps({ value: prevMonth });
        }
        expect(
          screen.getByText(adapterToUse.format(prevMonth, 'monthShort')),
        ).not.to.have.attribute('disabled');

        // TODO: define what appends when value is `null`
      });
    });

    it('should apply minDate', () => {
      render(
        <ElementToTest
          {...defaultProps}
          value={adapterToUse.date('2019-06-15')}
          minDate={adapterToUse.date('2019-06-04')}
        />,
      );

      expect(screen.getByText('Jan')).to.have.attribute('disabled');
      expect(screen.getByText('May')).to.have.attribute('disabled');
      expect(screen.getByText('Jun')).not.to.have.attribute('disabled');
      expect(screen.getByText('Jul')).not.to.have.attribute('disabled');
      expect(screen.getByText('Dec')).not.to.have.attribute('disabled');

      // TODO: define what appends when value is `null`
    });

    it('should apply maxDate', () => {
      render(
        <ElementToTest
          {...defaultProps}
          value={adapterToUse.date('2019-06-15')}
          maxDate={adapterToUse.date('2019-06-04')}
        />,
      );

      expect(screen.getByText('Jan')).not.to.have.attribute('disabled');
      expect(screen.getByText('Jun')).not.to.have.attribute('disabled');
      expect(screen.getByText('Jul')).to.have.attribute('disabled');
      expect(screen.getByText('Dec')).to.have.attribute('disabled');

      // TODO: define what appends when value is `null`
    });
  });
};
