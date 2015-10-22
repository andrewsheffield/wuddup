function makeNewPoint(document) {

		$.ajax({
			type: "POST",
		 	url: "/points",
			data: { title: "Point", note: "This and that and the other"},
			dataType: "json",
			success: function(point) {
				var update = { "mainPoint": point._id };
				saveDocument(document._id, update);
			}
		});

}

function addPointToDocument(id) {

	$.ajax({
			type: "GET",
		 	url: "/documents/" + id,
			dataType: "json",
			success: function(document) {
				makeNewPoint(document);
			}
		});

}

function saveDocument(id, update) {

	$.ajax({
			type: "PUT",
		 	url: "/documents/" + id,
		 	data: update,
			dataType: "json",
			success: function(document) {
				console.log(document);
			}
		});
}