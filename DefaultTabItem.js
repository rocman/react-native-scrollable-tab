'use strict';

import React, {View} from 'react-native';

const DefaultTabItem = React.createClass({
  title: '<ScrollableTabView.DefaultTabItem>',
  
  propTypes: {
    style: View.propTypes.style,
  },
  
  render: function() {
    const {children, index, ...props} = this.props;
    return (
      <View {...props}>
        {(index == 0 || this.state && this.state.initialized) && children}
      </View>
    );
  }
});

export default DefaultTabItem;