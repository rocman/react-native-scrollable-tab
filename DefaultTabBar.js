'use strict';

import React, {
  Animated,
  Component,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

function constrainInRange(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
class PropMeta {
  constructor(params) {
    Object.assign(this, params);
  }
  getFromProps(props) {
    return props[this.propName];
  }
  propsIntegrator(value) {
    const propName = this.propName;
    return function integrateIntoProps(props) {
      props[propName] = value;
    }; 
  }
  propsIntegration(value) {
    return {
      [this.propName]: this.propsIntegrator(value)
    };
  }
}
class NumbericPropMeta extends PropMeta {
  constructor() {
    super(...arguments);
  }
  default(v = 0) {
    return v;
  }
  add(a, b) {
    return a + b;
  }
  substract(a, b) {
    return a - b;
  }
  multiply(a, b) {
    return a * b;
  }
  divide(a, b) {
    return a / b;
  }
  differ(a, b) {
    return Math.abs(a - b) > 1;
  }
}
class CoordinatePropMeta extends PropMeta {
  constructor() {
    super(...arguments);
  }
  default(v = {}) {
    const {x = 0, y = 0} = v;
    return {x, y};
  }
  add(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  }
  substract(a, b) {
    return {
      x: a.x - b.x,
      y: a.y - b.y
    };
  }
  multiply(a, b) {
    return {
      x: a.x * b,
      y: a.y * b
    };
  }
  divide(a, b) {
    return {
      x: a.x / b,
      y: a.y / b
    };
  }
  differ(a, b) {
    return (
      Math.abs(a.x - b.x) > 1 ||
      Math.abs(a.y - b.y) > 1
    );
  }
}
class ColorPropMeta extends PropMeta {
  constructor() {
    super(...arguments);
  }
  default(v = []) {
    const [r = 0, g = 0, b = 0, a = 0] = v;
    return [r, g, b, a];
  }
  add(a, b) {
    return [
      a[0] + b[0], a[1] + b[1],
      a[2] + b[2], a[3] + b[3]
    ];
  }
  substract(a, b) {
    return [
      a[0] - b[0], a[1] - b[1],
      a[2] - b[2], a[3] - b[3]
    ];
  }
  multiply(a, b) {
    return [
      a[0] * b, a[1] * b,
      a[2] * b, a[3] * b
    ];
  }
  divide(a, b) {
    return [
      a[0] / b, a[1] / b,
      a[2] / b, a[3] / b
    ];
  }
  differ(a, b) {
    return (
      Math.abs(a[0] - b[0]) > 1 ||
      Math.abs(a[1] - b[1]) > 1 ||
      Math.abs(a[2] - b[2]) > 1 ||
      Math.abs(a[3] - b[3]) > 1
    );
  }
}
const Smooth = {
  PropMeta,
  NumbericPropMeta,
  CoordinatePropMeta,
  ColorPropMeta,
  createSmoothComponent: function(ComponentToSmooth, metasOfPropsToSmooth, duration = 300) {
    return class extends Component {
      constructor() {
        super(...arguments);
        this.state = {};
        this.timeoutsForTweens = {};
        this.targets = {};
      }
      render() {
        const props = {...this.props};
        for (let i in this.state) {
          this.state[i](props);
        }
        return (
          <ComponentToSmooth {...props} />
        );
      }
      componentWillReceiveProps(nextProps) {
        if (super.componentWillReceiveProps) {
          super.componentWillReceiveProps(...arguments);
        }
        const start = new Date;
        metasOfPropsToSmooth.forEach(meta => {
          const propName = meta.propName;
          const target = meta.default(meta.getFromProps(nextProps));
          const origin = meta.default(meta.getFromProps(this.props));
          if (this.timeoutsForTweens[propName]) {
            cancelAnimationFrame(this.timeoutsForTweens[propName]);
            this.timeoutsForTweens[propName] = null;
            this.setState(meta.propsIntegration(this.targets[propName]));
          }
          this.targets[propName] = target;
          if (meta.differ(target, origin)) {
            const diff = meta.substract(target, origin);
            const unit = meta.divide(diff, duration);
            let tween = () => {
              this.timeoutsForTweens[propName] = requestAnimationFrame(() => {
                const timePassed = new Date - start;
                if (timePassed > duration) {
                  this.timeoutsForTweens[propName] = null;
                  this.setState(meta.propsIntegration(target));
                  tween = null;
                  return;
                }
                const value = meta.add(origin, meta.multiply(unit, timePassed));
                const wrap = meta.propsIntegration(value);
                this.setState(wrap, tween);
              });
            };
            tween();
            return;
          }
          this.setState(meta.propsIntegration(target));
        });
      }
    }
  } 
}

const AnimatedView = (
  Animated.createAnimatedComponent(
    Smooth.createSmoothComponent(View, [
      new Smooth.NumbericPropMeta({
        propName: 'style.left',
        getFromProps: function(props) {
          return props.style && props.style.left;
        },
        propsIntegrator: function(value) {
          return function(props) {
            props.style = {...props.style, left: value};
          };
        }
      }),
      new Smooth.NumbericPropMeta({
        propName: 'style.width',
        getFromProps: function(props) {
          return props.style && props.style.width;
        },
        propsIntegrator: function(value) {
          return function(props) {
            props.style = {...props.style, width: value};
          };
        }
      })
    ])
  )
);

const AnimatedScrollView = (
  Animated.createAnimatedComponent(
    Smooth.createSmoothComponent(ScrollView, [
      new Smooth.CoordinatePropMeta({propName: 'contentOffset'})
    ])
  )
);

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
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingLeft: 6,
      paddingRight: 6
    },
    leftButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    rightButton: {
      backgroundColor: 'white',
      width: 28,
      height: 28
    },
    scrollView: {
      flex: 1,
      marginLeft: 6,
      marginRight: 6
    },
    contentContainer: {
      flex: 1,
      height: 44,
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
    
    const {contentSizeOfScrollView, layoutOfScrollView, layoutsOfTabOptions} = this.state || {};
    if (contentSizeOfScrollView && layoutOfScrollView && layoutsOfTabOptions && layoutsOfTabOptions.length) {
      const inputRange = [];
      const outputRangeLeft = [];
      const outputRangeWidth = [];
      const outputRangeOffset = [];
      const maxOffsetX = Math.max(contentSizeOfScrollView.width - layoutOfScrollView.width, 0);
      let temp = 0;
      layoutsOfTabOptions.forEach(function({width}, index) {
        inputRange.push(index);
        outputRangeLeft.push(temp);
        outputRangeWidth.push(width);
        outputRangeOffset.push(constrainInRange(
          /* value */ temp - (layoutOfScrollView.width - width) / 2,
          /* min   */ 0,
          /* max   */ maxOffsetX
        ));
        temp += width;
      });

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
          mapping: x => ({x})
        });
      }
      
      var highlight = (
        <AnimatedView style={[
          styles.highlight, this.props.highlightStyle, {left, width}
        ]} />
      );
    }

    return (
      <View style={[styles.root, this.props.style]}>
        <View style={[styles.leftButton, this.props.leftButtonStyle]}>
        </View>
        <AnimatedScrollView
          automaticallyAdjustContentInsets={false}
          contentContainerStyle={styles.contentContainer}
          contentOffset={offset}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollView}
          onContentSizeChange={this.scrollViewOnContentSizeChange.bind(this)}
          onLayout={this.scrollViewOnLayout.bind(this)}
          onScroll={this.scrollViewOnScroll.bind(this)}>
          {highlight}
          {this.props.tabs.map(this.renderTabOption.bind(this))}
        </AnimatedScrollView>
        <View style={[styles.rightButton, this.props.rightButtonStyle]}>
        </View>
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
        activeOpacity={0.9}
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
  scrollViewOnLayout({nativeEvent:{layout}}) {
    this.setState({layoutOfScrollView: layout});
  }
  scrollViewOnScroll({nativeEvent:{contentOffset:{x}}}) {
    this.scrollViewContentOffsetX = x;
  }
  tabOptionOnLayout({nativeEvent:{layout}}, page) {
    const {layoutsOfTabOptions = []} = this.state || {};
    layoutsOfTabOptions[page] = layout;
    this.setState({layoutsOfTabOptions});
  }
}

module.exports = DefaultTabBar;
export default DefaultTabBar;