using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlbumStore.Domain.Entities
{
    public class ApplicationLog
    {
        public Guid Id { get; set; }

        public string MachineName { get; set; }

        public DateTime LoggedAt { get; set; }

        public string Level { get; set; }

        public string Message { get; set; }

        public string Logger { get; set; }

        public string CallStack { get; set; }

        public string ExceptionMessage { get; set; }

        public string ExceptionSource { get; set; }
    }

}
