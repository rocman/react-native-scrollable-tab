'use strict';

import React, {
  Animated,
  Component,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function constrainInRange(value, min, max) {
  return value < min ? min : value > max ? max : value;
}

class DefaultTabBar extends Component {
  static propTypes = {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
  };
  styles = {
    root: {
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    contentContainer: {
      flex: 1,
      height: 44,
      paddingLeft: 6,
      paddingRight: 6,
      position: 'relative',
    },
    highlight: {
      borderColor: '#333',
      borderRadius: 14,
      borderWidth: 14,
      position: 'absolute',
      top: 8,
      bottom: 8,
    },
    tabOption: {
      root: {
        alignItems: 'center',
        backgroundColor: 'transparent',
        flex: 1,
        justifyContent: 'center',
        padding: 10
      },
      text: {
        fontSize: 16
      }
    }
  };
  constructor() {
    super(...arguments);
  }
  render() {
    const styles = this.styles;
    
    const containerWidth = this.props.containerWidth;
    const numberOfTabs = this.props.tabs.length;
    
    const {contentSizeOfScrollView, layoutsOfTabOptions} = this.state || {};
    if (contentSizeOfScrollView && layoutsOfTabOptions && layoutsOfTabOptions.length) {
      const inputRange = [];
      const outputRangeLeft = [];
      const outputRangeWidth = [];
      const outputRangeOffset = [];
      const maxOffsetX = contentSizeOfScrollView.width - containerWidth;
      let temp = 0;
      layoutsOfTabOptions.forEach(function({width}, index) {
        inputRange.push(index);
        outputRangeLeft.push(temp + styles.contentContainer.paddingLeft);
        outputRangeWidth.push(width);
        outputRangeOffset.push(constrainInRange(
          /* value */ temp - (containerWidth - width) / 2,
          /* min   */ 0,
          /* max   */ maxOffsetX
        ));
        temp += width;
      });
      
      console.log('range', 'inputRange', inputRange);
      console.log('range', 'outputRangeLeft', outputRangeLeft);
      console.log('range', 'outputRangeWidth', outputRangeWidth);
      console.log('range', 'outputRangeOffset', outputRangeOffset);

      if (inputRange.length > 1) {
        const left = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeLeft,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });

        const width = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeWidth,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp'
        });
        
        var offset = this.props.scrollValue.interpolate({
          inputRange: inputRange,
          outputRange: outputRangeOffset,
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          mapping: x => ({x, y: 0})
        });
      }
      
      var highlight = (
        <Animated.View style={[
          styles.highlight, this.props.highlightStyle, {left, width}
        ]} />
      );
    }

    return (
      <View style={[styles.root, this.props.style]}>
        <AnimatedScrollView
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.contentContainer}
          contentOffset={offset}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          onContentSizeChange={this.scrollViewOnContentSizeChange.bind(this)}>
          {highlight}
          {this.props.tabs.map(this.renderTabOption.bind(this))}
        </AnimatedScrollView>
      </View>
    );
  }
  renderTabOption(name, index) {
    const styles = this.styles.tabOption;
    const color = this.props.scrollValue.interpolate({
      inputRange: [index - 1, index, index + 1],
      outputRange: ['white', 'yellow', 'white']
    });
    return (
      <TouchableOpacity
        key={name}
        style={styles.root}
        onPress={e => this.props.goToPage(index)}
        onLayout={e => this.tabOptionOnLayout(e, index)}>
        <Animated.Text style={[styles.text, {color}]}>{name}</Animated.Text>
      </TouchableOpacity>
    );
  }
  scrollViewOnContentSizeChange(width, height) {
    this.setState({contentSizeOfScrollView: {width, height}});
  }
  tabOptionOnLayout({nativeEvent:{layout}}, page) {
    const {layoutsOfTabOptions = []} = this.state || {};
    layoutsOfTabOptions[page] = layout;
    this.setState({layoutsOfTabOptions});
  }
}

module.exports = DefaultTabBar;
export default DefaultTabBar;