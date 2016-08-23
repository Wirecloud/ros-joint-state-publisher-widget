/*
 * joint-state-publisher
 * https://github.com/Wirecloud/ros-joint-state-publisher-widget
 *
 * Copyright (c) 2016 CoNWeT, Universidad Politécnica de Madrid
 * Licensed under the Apache 2.0
 */

/* globals ROSLIB */

(function (mp) {

    "use strict";

    /** Replicating the joint_state_publisher node's functionality in the browser
     * @constructor
     * @param options - object with following keys:
     *   * ros - the ROSLIB.Ros connection handle
     *   * paramName - the parameter to read the robot description from
     *   * topicName - topic to publish joint states on
     *   * divID - the ID of the div to place the sliders
     *   *
     */
    var JointStatePublisher = function JointStatePublisher(options) {
        options = options || {};
        var ros = options.ros;
        var paramName = options.paramName || 'robot_description';
        var topicName = options.topicName || '/web_joint_states';
        var divID = options.divID || 'sliders';

        this.container = document.getElementById(divID);
        this.sliders = [];

        var param = new ROSLIB.Param({
            ros: ros,
            name: paramName
        });
        param.get(this.loadModel.bind(this));

        this.topic = new ROSLIB.Topic({
            ros: ros,
            name: topicName,
            messageType: 'sensor_msgs/JointState'
        });
    };

    JointStatePublisher.prototype.publish = function publish() {
        var names = [];
        var values = [];
        for (var index = 0; index < this.sliders.length; index++) {
            var slider = this.sliders[index];
            names[ names.length ] = slider.name;
            values[ values.length ] = parseFloat(slider.value);
        }

        var currentTime = new Date();
        var secs = Math.floor(currentTime.getTime() / 1000);
        var nsecs = Math.round(1000000000 * (currentTime.getTime() / 1000 - secs));
        var js = new ROSLIB.Message({
            header: {
                stamp: {
                    secs: secs,
                    nsecs: nsecs
                },
                frame_id: ''
            },
            name: names,
            position: values,
            velocity: [],
            effort: []
        });
        this.topic.publish(js);
    };

    JointStatePublisher.prototype.updateInput = function updateInput(event) {
        var name = event.target.name;
        var target;
        if (name.indexOf('_text') >= 0) {
            target = name.replace('_text', '_slider');
        } else {
            target = name + '_text';
        }
        document.getElementById(target).value = event.target.value;
        this.publish();
    };

    JointStatePublisher.prototype.loadModel = function loadModel(param) {
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(param, 'text/xml');

        // See https://developer.mozilla.org/docs/XPathResult#Constants
        var XPATH_FIRST_ORDERED_NODE_TYPE = 9;

        var robotXml = xmlDoc.evaluate('//robot', xmlDoc, null, XPATH_FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        for (var nodes = robotXml.childNodes, i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.tagName === 'joint') {
                if (node.getAttribute('type') !== 'fixed') {

                    var minval, maxval, val;
                    if (node.getAttribute('type') === 'continuous') {
                        minval = -3.1415;
                        maxval = 3.1415;
                        val = 0;
                    } else {
                        var limit = node.getElementsByTagName('limit')[0];
                        minval = parseFloat(limit.getAttribute('lower'));
                        maxval = parseFloat(limit.getAttribute('upper'));
                        if (minval <= 0 && maxval >= 0) {
                            val = 0;
                        } else {
                            val = (maxval + minval) / 2;
                        }
                    }

                    var name = node.getAttribute('name');
                    var x = document.createTextNode(name);
                    this.container.appendChild(x);
                    x = document.createElement('input');
                    x.setAttribute('name', name + '_text');
                    x.setAttribute('id', name + '_text');
                    x.setAttribute('style', 'float: right');
                    x.setAttribute('value', val);
                    x.onblur = this.updateInput.bind(this);
                    this.container.appendChild(x);
                    this.container.appendChild(document.createElement('br'));

                    x = document.createElement('input');
                    x.setAttribute('name', name);
                    x.setAttribute('id', name + '_slider');
                    x.setAttribute('type', 'range');
                    x.setAttribute('min', minval);
                    x.setAttribute('max', maxval);
                    x.setAttribute('value', val);
                    x.setAttribute('step', (maxval - minval) / 100);
                    x.setAttribute('style', 'width: 100%');
                    x.onchange = this.updateInput.bind(this);
                    this.container.appendChild(x);
                    this.container.appendChild(document.createElement('br'));
                    this.sliders[this.sliders.length] = x;
                }
            }
        }
    };

    window.onload = function () {

        var ros = new ROSLIB.Ros({
            url: mp.prefs.get('ros_bridge_url')
        });

        new JointStatePublisher({
            ros: ros,
            divID: 'sliders',
            topicName: mp.prefs.get('topic_name')
        });
    };

})(MashupPlatform);
