const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

exports.handler = async (event) => {

	let validationResponse = validate(event);
	if (validationResponse.statusCode !== 200) {
		return {
			statusCode: 422,
			body: validationResponse.message
		};
	}

	let chart = await createChart(
		event.labels,
		event.datasets
	);

    const response = {
        statusCode: 200,
        body: chart,
	};

    return response;
};

function validate (event)
{
	if (!event.labels && !event.datasets) {
		return {
			statusCode: 422,
			message: "Labels and/or datasets are missing"
		}
	}
	
	if (!event.labels.length || !event.datasets.length) {
		return {
			statusCode: 422,
			message: "Labels and/or datasets are empty"
		}
	}

	if (event.datasets.length !== 2) {
		return {
			statusCode: 422,
			message: "Datasets must be an array of 2 elements"
		}
	}

	const eventLength = event.labels.length;
	if (event.datasets[0].data.length !== eventLength && event.datasets[1].data.length !== eventLength) {
		return {
			statusCode: 422,
			message: "Labels and datasets must be of the same length"
		}
	}

	return {
		statusCode: 200
	};
}

async function createChart (labels, datasets)
{
	const width = parseInt(process.env.CANVAS_WIDTH) || 800;
  	const height = parseInt(process.env.CANVAS_HEIGHT) || 600;
	const backgroundColour = process.env.CANVAS_BACKGROUND || 'white';
	
  	const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour });
  
  	const data = {
		labels: labels,
		datasets: [{
			label: datasets[0].label,
			data: datasets[0].data,
			backgroundColor : 'rgba(31,162,255, 0.6)',
            borderColor: 'rgba(31,162,255, 1)',
            pointBackgroundColor: '#FFFFFF',
            pointRadius: 5,
			borderWidth: 2,
			tension: 0.4,
            fill: 'origin'
		}, {
			label: datasets[1].label,
			data: datasets[1].data,
			borderColor: 'rgba(127,0,255, 1)',
            backgroundColor: 'rgba(127,0,255, 0.6)',
            pointBackgroundColor: '#FFFFFF',
            pointRadius: 5,
			borderWidth: 2,
			tension: 0.4,
            fill: 'origin'
		}]
	};
	
	const configuration = {
		type: 'line',
		data: data,
		options: {},
		plugins: []
	};
	
	return await chartJSNodeCanvas.renderToDataURL(configuration);
}
