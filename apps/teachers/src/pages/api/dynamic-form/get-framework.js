export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { code, fetchUrl, selectedvalue, findcode } = req.body;

      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: fetchUrl,
        headers: {
          Accept: '*/*',
        },
      };

      let updatedSelectedvalue = null;
      if (selectedvalue) {
        updatedSelectedvalue = Array.isArray(selectedvalue)
          ? selectedvalue
          : [selectedvalue];
      }

      axios
        .request(config)
        .then((response) => {
          let options = [];

          if (
            response?.data?.result?.framework?.categories &&
            response?.data?.result?.framework?.categories.length > 0
          ) {
            let frameworkFilter = response?.data?.result?.framework;

            frameworkFilter.categories.map((categories) => {
              if (categories?.code === code) {
                if (updatedSelectedvalue && updatedSelectedvalue.length > 0) {
                  // console.log('in found state', updatedSelectedvalue);
                  const categories_terms = categories?.terms;
                  // console.log('in categories_terms', categories_terms);
                  const filteredData = categories_terms?.filter((item) =>
                    selectedvalue.includes(item.name)
                  );
                  // console.log('in filteredData', filteredData);
                  if (filteredData) {
                    options = filteredData?.flatMap((data) =>
                      (data?.associations ?? []) // Ensure associations exist, default to empty array
                        .filter((assoc) => assoc?.category === findcode)
                        .map((assoc) => ({
                          label: assoc.name,
                          value: assoc.name,
                        }))
                    );
                  }
                  // console.log('options', JSON.stringify(options));
                } else if (selectedvalue != '') {
                  // Transform terms into options
                  // console.log('in initial state');
                  options = categories?.terms.map((term) => ({
                    label: term.name,
                    value: term.name,
                  }));
                }
                // console.log('option', options);
              }
            });
          }
          const sortedOptions = options.sort((a, b) =>
            a.label.localeCompare(b.label)
          );
          const uniqueData = Array.from(
            new Map(sortedOptions.map((item) => [item.value, item])).values()
          );
          res.status(200).json({ options: uniqueData });
        })
        .catch((error) => {
          // console.log(error);
          res.status(500).json({ error: error.message });
        });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
