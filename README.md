# Description

The `identityfusion` module turns an HTML input into an interactive
widget for the user to indicate the degree to which their own identity
fuses with a group identity. The widget consists of a circle labeled
"Me" which can be dragged or moved using buttons to overlap a circle
which represents the group. Two values are recorded:

1. Distance
2. Overlap

# Usage

To use the widget, create an HTML input with a name:

  <input name="DIFI" id="DIFI" />

Then create a new DIFIInput instance:

  <script>
    var el = document.getElementById('DIFI');
    new dynamicidentity.DIFIInput(el, {
      groupLabel: 'USA'
    });
  </script>

Instantiating the DIFIInput will replace the original input
with two hidden inputs named `DIFI_distance` and `DIFI_overlap`
(with the original name as the prefix).

See `dist/demo.html` for an example.

# Options

Several options can be specified in the second parameter
when constructing a DIFIInput:

* meLabel: The label for the circle representing the user. (Default: `Me`)
* groupLabel: The label for the circle representing the group. (Default: `Group`)
* groupImage: URL for an image to be shown as the background of the group circle. (Default: none)
