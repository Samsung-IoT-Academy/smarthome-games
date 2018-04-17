function LightRange(name, range, minValue, maxValue, value, icon, onChanged, onIconClick)
{
	this.name = name;
	this.elementValue = typeof $(value)[0] != undefined ? $(value) : undefined;
	this.elementRange = typeof $(range)[0] != undefined  ? $(range) : undefined;
	this.elementIcon = typeof $(icon)[0] != undefined  ? $(icon) : undefined;
	this.min = minValue;
	this.max = maxValue;

	
	this.elementRange.attr('min', this.min);
	this.elementRange.attr('max', this.max);
	this.elementValue.text(this.elementRange.val());

	this.onChanged = onChanged;

	this.setValue = function(value, noevents) {
		if (noevents == true) this.elementRange.attr("ignore",1);
		this.elementRange.val(value);
		this.elementValue.text(value);
	}
	this.getValue = function() {
		return this.elementRange.val();
	}
	
	var rangeDOM = this.elementRange[0];
	var valueDOM = this.elementValue[0];

	this.elementRange.change(function() {
		var el = rangeDOM;
		var val = $(this).val();
		console.log(name + ": onChange > " + val);

		if (typeof onChanged == "function" && !el.hasAttribute("ignore")) {
			if (onChanged(name, val)) {
				$(valueDOM).text(val);
			}
		} else {
			$(valueDOM).text(val);
			$(el).removeAttr("ignore");
		}
		
			
		
	});

	if (this.elementIcon) this.elementIcon.on('click', function () {
		console.log(name + ": onIconClick");
		if (typeof onIconClick == "function") {
			onIconClick(this);
		}
	})

}

function LightRangeRGB(name, r, g, b, minValue, maxValue, rval, gval, bval, icon, onChanged, onIconClick)
{
	this.name = name;
	var _onComponentChanged = function(el, val) {
		var r = $(r).val();
		var g = $(g).val();
		var b = $(b).val();

		if (typeof onChanged == "function") 
			return onChanged(name, val, el[el.length-1]);
		else
			return true;
	
	};
	this.rangeRed = new LightRange(name + "_R", r, minValue, maxValue, rval, icon, _onComponentChanged, onIconClick);
	this.rangeGreen = new LightRange(name + "_G", g, minValue, maxValue, gval, null,_onComponentChanged);
	this.rangeBlue = new LightRange(name + "_B", b, minValue, maxValue, bval, null, _onComponentChanged);

	this.setValue = function(r, g, b) {
		this.rangeRed.setValue(r);
		this.rangeGreen.setValue(g);
		this.rangeBlue.setValue(b);	
	}
}

function SensorDisplay(el, initVal = 0) {
	this.element = $(el);
	this.element.text(initVal);
	
	this.update = function(value) {
		 $(el).text(value);
	}
}
